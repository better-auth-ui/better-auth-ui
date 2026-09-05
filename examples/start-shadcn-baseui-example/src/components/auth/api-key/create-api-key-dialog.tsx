"use client"

import {
  type ApiKeyAuthClient,
  apiKeyExpirationDaysToSeconds
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCreateApiKey } from "@better-auth-ui/react/plugins/api-key"
import { Key } from "lucide-react"
import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
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
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { useAuthForm } from "../auth-form"
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
    localization: apiKeyLocalization
  } = useAuthPlugin(apiKeyPlugin)

  const { mutateAsync: createApiKey, isPending: isCreating } =
    useCreateApiKey(authClient)

  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const availableConfigurations = configurations.filter(
    (configuration) => configuration.organization === Boolean(organizationId)
  )

  const form = useAuthForm({
    defaultValues: {
      configId: availableConfigurations[0]?.id ?? "",
      expiration:
        keyExpiration === false || keyExpiration?.defaultInterval == null
          ? "never"
          : String(keyExpiration.defaultInterval),
      name: ""
    },
    onSubmit: async ({ value }) => {
      const name = value.name.trim()
      const expirationDays =
        value.expiration !== "never" ? Number(value.expiration) : undefined
      const expiresIn = expirationDays
        ? apiKeyExpirationDaysToSeconds(expirationDays)
        : undefined
      const configId = value.configId.trim()
      const resolvedConfigId =
        configId || (organizationId ? "organization" : undefined)
      const payload = {
        ...(name ? { name } : {}),
        ...(expiresIn ? { expiresIn } : {}),
        ...(resolvedConfigId ? { configId: resolvedConfigId } : {}),
        ...(organizationId ? { organizationId } : {})
      }
      await createApiKey(
        Object.keys(payload).length > 0 ? payload : undefined,
        {
          onSuccess: (result) => {
            handleOpenChange(false)
            setKeyName(name)
            setSecretKey(result.key)
            setIsNewKeyDialogOpen(true)
          }
        }
      )
    }
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setKeyName(null)
      setSecretKey(null)
      form.reset()
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form.AppForm>
            <form.AuthFormRoot className="flex flex-col gap-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key />
                  {apiKeyLocalization.createApiKey}
                </DialogTitle>

                <DialogDescription>
                  {apiKeyLocalization.apiKeysDescription}
                </DialogDescription>
              </DialogHeader>

              <FieldGroup>
                <form.AppField name="name">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="api-key-name">
                        {apiKeyLocalization.name}
                      </FieldLabel>

                      <Input
                        id="api-key-name"
                        name={field.name}
                        autoFocus
                        placeholder={localization.settings.optional}
                        disabled={isCreating}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />

                      <FieldError />
                    </Field>
                  )}
                </form.AppField>

                {availableConfigurations.length > 0 && (
                  <form.AppField name="configId">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="api-key-configuration">
                          {apiKeyLocalization.configuration}
                        </FieldLabel>
                        <Select
                          items={availableConfigurations.map(
                            (configuration) => ({
                              label: configuration.label,
                              value: configuration.id
                            })
                          )}
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(value ?? "")
                          }
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
                  </form.AppField>
                )}

                {keyExpiration ? (
                  <form.AppField name="expiration">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="api-key-expiration">
                          {apiKeyLocalization.expiration}
                        </FieldLabel>

                        <Select
                          items={[
                            ...keyExpiration.intervals.map((days) => ({
                              label: `${days.toLocaleString()} ${
                                days === 1
                                  ? apiKeyLocalization.day
                                  : apiKeyLocalization.days
                              }`,
                              value: String(days)
                            })),
                            ...(keyExpiration.allowNever
                              ? [
                                  {
                                    label: apiKeyLocalization.never,
                                    value: "never"
                                  }
                                ]
                              : [])
                          ]}
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(value ?? "")
                          }
                          disabled={isCreating}
                        >
                          <SelectTrigger
                            id="api-key-expiration"
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              {keyExpiration.intervals.map((days) => (
                                <SelectItem key={days} value={String(days)}>
                                  {days.toLocaleString()}{" "}
                                  {days === 1
                                    ? apiKeyLocalization.day
                                    : apiKeyLocalization.days}
                                </SelectItem>
                              ))}

                              {keyExpiration.allowNever ? (
                                <SelectItem value="never">
                                  {apiKeyLocalization.never}
                                </SelectItem>
                              ) : null}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  </form.AppField>
                ) : null}
              </FieldGroup>

              <DialogFooter>
                <DialogClose
                  className={buttonVariants({ variant: "outline" })}
                  disabled={isCreating}
                  type="button"
                >
                  {localization.settings.cancel}
                </DialogClose>

                <form.AuthFormSubmitButton
                  isPending={isCreating}
                  disabled={isCreating}
                >
                  {apiKeyLocalization.createApiKey}
                </form.AuthFormSubmitButton>
              </DialogFooter>
            </form.AuthFormRoot>
          </form.AppForm>
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
