import {
  type ApiKeyAuthClient,
  apiKeyExpirationDaysToSeconds
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCreateApiKey } from "@better-auth-ui/react/plugins/api-key"
import { Key } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Checkbox,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  Switch,
  TextArea,
  TextField
} from "@heroui/react"
import { type SyntheticEvent, useState } from "react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"

import { NewApiKeyDialog } from "./new-api-key-dialog"

export type CreateApiKeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Create an organization-owned key by passing the organization id. */
  organizationId?: string
}

export function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  organizationId
}: CreateApiKeyDialogProps) {
  const { authClient, localization } = useAuth()
  const {
    configurations,
    keyExpiration,
    localization: apiKeyLocalization,
    permissions
  } = useAuthPlugin(apiKeyPlugin)

  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey(
    authClient as ApiKeyAuthClient
  )

  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false)
  const [formError, setFormError] = useState<string>()
  const availableConfigurations = configurations.filter(
    (configuration) => configuration.organization === Boolean(organizationId)
  )

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setKeyName(null)
      setSecretKey(null)
    }

    onOpenChange(open)
  }

  const handleNewKeyDialogOpenChange = (open: boolean) => {
    setIsNewKeyDialogOpen(open)

    if (!open) {
      setKeyName(null)
      setSecretKey(null)
    }
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string)?.trim()
    const expiration = formData.get("expiration")
    const expirationDays =
      typeof expiration === "string" && expiration !== "never"
        ? Number(expiration)
        : undefined
    const expiresIn = expirationDays
      ? apiKeyExpirationDaysToSeconds(expirationDays)
      : undefined

    const selectedConfig = String(formData.get("configId") ?? "").trim()
    const resolvedConfigId =
      selectedConfig || (organizationId ? "organization" : undefined)
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
      <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <Form onSubmit={handleSubmit}>
              <AlertDialog.CloseTrigger />

              <AlertDialog.Header>
                <AlertDialog.Icon status="default">
                  <Key />
                </AlertDialog.Icon>

                <AlertDialog.Heading>
                  {apiKeyLocalization.createApiKey}
                </AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body className="overflow-visible">
                <p className="text-muted text-sm">
                  {apiKeyLocalization.apiKeysDescription}
                </p>

                <div className="mt-4 flex flex-col gap-4">
                  <TextField id="name" name="name" isDisabled={isCreating}>
                    <Label>{apiKeyLocalization.name}</Label>

                    <Input
                      autoFocus
                      placeholder={localization.settings.optional}
                      variant="secondary"
                    />

                    <FieldError />
                  </TextField>

                  {availableConfigurations.length > 0 && (
                    <Select
                      defaultValue={availableConfigurations[0]?.id}
                      fullWidth
                      isDisabled={isCreating}
                      name="configId"
                      variant="secondary"
                    >
                      <Label>{apiKeyLocalization.configuration}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {availableConfigurations.map((configuration) => (
                            <ListBox.Item
                              id={configuration.id}
                              key={configuration.id}
                              textValue={configuration.label}
                            >
                              {configuration.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}

                  {keyExpiration ? (
                    <Select
                      defaultValue={
                        keyExpiration.defaultInterval === null
                          ? "never"
                          : String(keyExpiration.defaultInterval)
                      }
                      fullWidth
                      isDisabled={isCreating}
                      name="expiration"
                      variant="secondary"
                    >
                      <Label>{apiKeyLocalization.expiration}</Label>

                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>

                      <Select.Popover>
                        <ListBox>
                          {keyExpiration.intervals.map((days) => (
                            <ListBox.Item
                              id={String(days)}
                              key={days}
                              textValue={`${days.toLocaleString()} ${
                                days === 1
                                  ? apiKeyLocalization.day
                                  : apiKeyLocalization.days
                              }`}
                            >
                              {days.toLocaleString()}{" "}
                              {days === 1
                                ? apiKeyLocalization.day
                                : apiKeyLocalization.days}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}

                          {keyExpiration.allowNever ? (
                            <ListBox.Item
                              id="never"
                              textValue={apiKeyLocalization.never}
                            >
                              {apiKeyLocalization.never}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ) : null}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField name="remaining" type="number">
                      <Label>{apiKeyLocalization.quota}</Label>
                      <Input min={0} variant="secondary" />
                    </TextField>
                    <TextField name="refillAmount" type="number">
                      <Label>{apiKeyLocalization.refillAmount}</Label>
                      <Input min={1} variant="secondary" />
                    </TextField>
                    <TextField name="refillInterval" type="number">
                      <Label>{apiKeyLocalization.refillInterval}</Label>
                      <Input min={1} variant="secondary" />
                    </TextField>
                    <Switch
                      isSelected={rateLimitEnabled}
                      onChange={setRateLimitEnabled}
                    >
                      {apiKeyLocalization.rateLimit}
                    </Switch>
                    <TextField name="rateLimitMax" type="number">
                      <Label>{apiKeyLocalization.rateLimitMax}</Label>
                      <Input min={1} variant="secondary" />
                    </TextField>
                    <TextField name="rateLimitTimeWindow" type="number">
                      <Label>{apiKeyLocalization.rateLimitWindow}</Label>
                      <Input min={1} variant="secondary" />
                    </TextField>
                  </div>

                  {permissions.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <Label>{apiKeyLocalization.permissions}</Label>
                      {permissions.map((permission) => (
                        <div
                          className="flex flex-col gap-2"
                          key={permission.resource}
                        >
                          <span className="text-sm font-medium">
                            {permission.label ?? permission.resource}
                          </span>
                          <div className="flex flex-wrap gap-3">
                            {permission.actions.map((action) => {
                              const actionId =
                                typeof action === "string" ? action : action.id
                              return (
                                <Checkbox
                                  key={actionId}
                                  name={`permission:${permission.resource}:${actionId}`}
                                >
                                  {typeof action === "string"
                                    ? action
                                    : action.label}
                                </Checkbox>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <TextField name="metadata">
                    <Label>{apiKeyLocalization.metadata}</Label>
                    <TextArea rows={3} variant="secondary" />
                  </TextField>
                  {formError && (
                    <p className="text-sm text-danger" role="alert">
                      {formError}
                    </p>
                  )}
                </div>
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={isCreating}>
                  {localization.settings.cancel}
                </Button>

                <Button type="submit" isPending={isCreating}>
                  {isCreating && <Spinner color="current" size="sm" />}

                  {apiKeyLocalization.createApiKey}
                </Button>
              </AlertDialog.Footer>
            </Form>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <NewApiKeyDialog
        isOpen={isNewKeyDialogOpen}
        onOpenChange={handleNewKeyDialogOpenChange}
        secretKey={secretKey}
        name={keyName}
      />
    </>
  )
}
