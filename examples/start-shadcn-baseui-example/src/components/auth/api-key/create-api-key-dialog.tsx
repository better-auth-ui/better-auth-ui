"use client"

import {
  type ApiKeyAuthClient,
  apiKeyExpirationDaysToSeconds
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCreateApiKey } from "@better-auth-ui/react/plugins/api-key"
import { Key } from "lucide-react"
import { type SyntheticEvent, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { NewApiKeyDialog } from "./new-api-key-dialog"

export type CreateApiKeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Create an organization-owned key by passing the organization id. */
  organizationId?: string
}

export function CreateApiKeyDialog({
  open,
  onOpenChange,
  organizationId
}: CreateApiKeyDialogProps) {
  const { authClient, localization } = useAuth<ApiKeyAuthClient>()
  const {
    configurations,
    keyExpiration,
    localization: apiKeyLocalization,
    permissions
  } = useAuthPlugin(apiKeyPlugin)

  const { mutate: createApiKey, isPending: isCreating } =
    useCreateApiKey(authClient)

  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false)
  const [formError, setFormError] = useState<string>()
  const availableConfigurations = configurations.filter(
    (configuration) => configuration.organization === Boolean(organizationId)
  )
  const expirationItems = keyExpiration
    ? [
        ...keyExpiration.intervals.map((days) => ({
          label: `${days.toLocaleString()} ${
            days === 1 ? apiKeyLocalization.day : apiKeyLocalization.days
          }`,
          value: String(days)
        })),
        ...(keyExpiration.allowNever
          ? [{ label: apiKeyLocalization.never, value: "never" }]
          : [])
      ]
    : []

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setKeyName(null)
      setSecretKey(null)
    }

    onOpenChange(nextOpen)
  }

  const handleNewKeyDialogOpenChange = (nextOpen: boolean) => {
    setIsNewKeyDialogOpen(nextOpen)

    if (!nextOpen) {
      setKeyName(null)
      setSecretKey(null)
    }
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string).trim()
    const expiration = formData.get("expiration")
    const expirationDays =
      typeof expiration === "string" && expiration !== "never"
        ? Number(expiration)
        : undefined
    const expiresIn = expirationDays
      ? apiKeyExpirationDaysToSeconds(expirationDays)
      : undefined

    const numberValue = (field: string) => {
      const value = String(formData.get(field) ?? "").trim()
      return value ? Number(value) : undefined
    }
    const selectedPermissions = Object.fromEntries(
      permissions
        .map((permission) => {
          const actions = permission.actions
            .map((action) => (typeof action === "string" ? action : action.id))
            .filter((action) =>
              formData.has(`permission:${permission.resource}:${action}`)
            )
          return [permission.resource, actions] as const
        })
        .filter(([, actions]) => actions.length)
    )
    let metadata: unknown
    try {
      const metadataText = String(formData.get("metadata") ?? "").trim()
      metadata = metadataText ? JSON.parse(metadataText) : undefined
      setFormError(undefined)
    } catch {
      setFormError("Metadata must contain valid JSON.")
      return
    }
    const configId = String(formData.get("configId") ?? "").trim()
    const resolvedConfigId =
      configId || (organizationId ? "organization" : undefined)
    const payload = {
      ...(name ? { name } : {}),
      ...(expiresIn ? { expiresIn } : {}),
      ...(resolvedConfigId ? { configId: resolvedConfigId } : {}),
      ...(organizationId ? { organizationId } : {}),
      ...(metadata ? { metadata } : {}),
      ...(Object.keys(selectedPermissions).length
        ? { permissions: selectedPermissions }
        : {}),
      remaining: numberValue("remaining"),
      refillAmount: numberValue("refillAmount"),
      refillInterval: numberValue("refillInterval"),
      rateLimitEnabled,
      rateLimitMax: numberValue("rateLimitMax"),
      rateLimitTimeWindow: numberValue("rateLimitTimeWindow")
    }

    createApiKey(Object.keys(payload).length > 0 ? payload : undefined, {
      onSuccess: (result) => {
        handleOpenChange(false)
        setKeyName(name)
        setSecretKey(result.key)
        setIsNewKeyDialogOpen(true)
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>
                <Key />
                {apiKeyLocalization.createApiKey}
              </DialogTitle>

              <DialogDescription>
                {apiKeyLocalization.apiKeysDescription}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="api-key-name">
                  {apiKeyLocalization.name}
                </FieldLabel>

                <Input
                  id="api-key-name"
                  name="name"
                  autoFocus
                  placeholder={localization.settings.optional}
                  disabled={isCreating}
                />

                <FieldError />
              </Field>

              {availableConfigurations.length > 0 && (
                <Field>
                  <FieldLabel htmlFor="api-key-configuration">
                    {apiKeyLocalization.configuration}
                  </FieldLabel>
                  <Select
                    items={availableConfigurations.map((configuration) => ({
                      label: configuration.label,
                      value: configuration.id
                    }))}
                    name="configId"
                    defaultValue={availableConfigurations[0]?.id}
                    disabled={isCreating}
                  >
                    <SelectTrigger
                      id="api-key-configuration"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {availableConfigurations.map((configuration) => (
                          <SelectItem
                            key={configuration.id}
                            value={configuration.id}
                          >
                            {configuration.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {keyExpiration ? (
                <Field>
                  <FieldLabel htmlFor="api-key-expiration">
                    {apiKeyLocalization.expiration}
                  </FieldLabel>

                  <Select
                    items={expirationItems}
                    name="expiration"
                    defaultValue={
                      keyExpiration.defaultInterval === null
                        ? "never"
                        : String(keyExpiration.defaultInterval)
                    }
                    disabled={isCreating}
                  >
                    <SelectTrigger id="api-key-expiration" className="w-full">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {expirationItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  name="remaining"
                  label={apiKeyLocalization.quota}
                />
                <NumberField
                  name="refillAmount"
                  label={apiKeyLocalization.refillAmount}
                />
                <NumberField
                  name="refillInterval"
                  label={apiKeyLocalization.refillInterval}
                />
                <Field orientation="horizontal">
                  <Switch
                    id="api-key-rate-limit"
                    checked={rateLimitEnabled}
                    onCheckedChange={setRateLimitEnabled}
                  />
                  <FieldLabel htmlFor="api-key-rate-limit">
                    {apiKeyLocalization.rateLimit}
                  </FieldLabel>
                </Field>
                <NumberField
                  name="rateLimitMax"
                  label={apiKeyLocalization.rateLimitMax}
                />
                <NumberField
                  name="rateLimitTimeWindow"
                  label={apiKeyLocalization.rateLimitWindow}
                />
              </div>

              {permissions.map((permission) => (
                <Field key={permission.resource}>
                  <FieldLabel>
                    {permission.label ?? permission.resource}
                  </FieldLabel>
                  <div className="flex flex-wrap gap-3">
                    {permission.actions.map((action) => {
                      const id = typeof action === "string" ? action : action.id
                      const checkboxId = `api-key-permission-${permission.resource}-${id}`
                      return (
                        <label
                          className="flex items-center gap-2 text-sm"
                          htmlFor={checkboxId}
                          key={id}
                        >
                          <Checkbox
                            id={checkboxId}
                            name={`permission:${permission.resource}:${id}`}
                          />
                          {typeof action === "string" ? action : action.label}
                        </label>
                      )
                    })}
                  </div>
                </Field>
              ))}

              <Field>
                <FieldLabel htmlFor="api-key-metadata">
                  {apiKeyLocalization.metadata}
                </FieldLabel>
                <Textarea id="api-key-metadata" name="metadata" rows={3} />
                {formError && <FieldError>{formError}</FieldError>}
              </Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose
                className={buttonVariants({ variant: "outline" })}
                disabled={isCreating}
                type="button"
              >
                {localization.settings.cancel}
              </DialogClose>

              <Button type="submit" disabled={isCreating}>
                {isCreating && <Spinner />}

                {apiKeyLocalization.createApiKey}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <NewApiKeyDialog
        open={isNewKeyDialogOpen}
        onOpenChange={handleNewKeyDialogOpenChange}
        secretKey={secretKey}
        name={keyName}
      />
    </>
  )
}

function NumberField({ name, label }: { name: string; label: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={`api-key-${name}`}>{label}</FieldLabel>
      <Input id={`api-key-${name}`} name={name} type="number" min={0} />
    </Field>
  )
}
