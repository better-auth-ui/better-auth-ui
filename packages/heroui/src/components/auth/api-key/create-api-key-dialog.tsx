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
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  TextField
} from "@heroui/react"
import { useState } from "react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { useAuthForm } from "../auth-form"

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
  const { authClient, locale, localization } = useAuth<ApiKeyAuthClient>()
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setKeyName(null)
      setSecretKey(null)
      form.reset()
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

  const form = useAuthForm({
    defaultValues: {
      configId: availableConfigurations[0]?.id ?? "",
      expiration:
        keyExpiration && keyExpiration.defaultInterval === null
          ? "never"
          : String(keyExpiration?.defaultInterval ?? "never"),
      name: ""
    },
    onSubmit: async ({ value }) => {
      const name = value.name.trim()
      const expirationDays =
        value.expiration !== "never" ? Number(value.expiration) : undefined
      const expiresIn = expirationDays
        ? apiKeyExpirationDaysToSeconds(expirationDays)
        : undefined

      const selectedConfig = value.configId.trim()
      const resolvedConfigId =
        selectedConfig || (organizationId ? "organization" : undefined)
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

  return (
    <>
      <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <form.AppForm>
              <form.AuthFormRoot>
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
                    <form.AppField name="name">
                      {(field) => (
                        <TextField
                          id="name"
                          name={field.name}
                          isDisabled={isCreating}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={field.handleChange}
                        >
                          <Label>{apiKeyLocalization.name}</Label>

                          <Input
                            autoFocus
                            placeholder={localization.settings.optional}
                            variant="secondary"
                          />

                          <FieldError />
                        </TextField>
                      )}
                    </form.AppField>

                    {availableConfigurations.length > 0 && (
                      <form.AppField name="configId">
                        {(field) => (
                          <Select
                            value={field.state.value}
                            onChange={(value) =>
                              field.handleChange(
                                value == null ? "" : String(value)
                              )
                            }
                            fullWidth
                            isDisabled={isCreating}
                            name={field.name}
                            variant="secondary"
                          >
                            <Label>{apiKeyLocalization.configuration}</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                {availableConfigurations.map(
                                  (configuration) => (
                                    <ListBox.Item
                                      id={configuration.id}
                                      key={configuration.id}
                                      textValue={configuration.label}
                                    >
                                      {configuration.label}
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  )
                                )}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        )}
                      </form.AppField>
                    )}

                    {keyExpiration ? (
                      <form.AppField name="expiration">
                        {(field) => (
                          <Select
                            value={field.state.value}
                            onChange={(value) =>
                              field.handleChange(
                                value == null ? "" : String(value)
                              )
                            }
                            fullWidth
                            isDisabled={isCreating}
                            name={field.name}
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
                                    textValue={`${days.toLocaleString(locale.languageTag)} ${
                                      days === 1
                                        ? apiKeyLocalization.day
                                        : apiKeyLocalization.days
                                    }`}
                                  >
                                    {days.toLocaleString(locale.languageTag)}{" "}
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
                        )}
                      </form.AppField>
                    ) : null}
                  </div>
                </AlertDialog.Body>

                <AlertDialog.Footer>
                  <Button
                    slot="close"
                    variant="tertiary"
                    isDisabled={isCreating}
                  >
                    {localization.settings.cancel}
                  </Button>

                  <form.AuthFormSubmitButton isDisabled={isCreating}>
                    {isCreating && <Spinner color="current" size="sm" />}

                    {apiKeyLocalization.createApiKey}
                  </form.AuthFormSubmitButton>
                </AlertDialog.Footer>
              </form.AuthFormRoot>
            </form.AppForm>
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
