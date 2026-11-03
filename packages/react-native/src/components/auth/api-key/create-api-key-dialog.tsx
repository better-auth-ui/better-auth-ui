import { apiKeyExpirationDaysToSeconds } from "@better-auth-ui/core/plugins/api-key"
import { Select } from "../../../primitives/menu"
import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCreateApiKey } from "@better-auth-ui/react/plugins/api-key"
import { useState } from "react"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { useAuthForm } from "../auth-form"
import { Txt } from "../../../primitives/styled"
import { Key } from "../../../primitives/ui-icons"
import { NewApiKeyDialog } from "./new-api-key-dialog"

export type CreateApiKeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Create an organization-owned key by passing the organization id. */
  organizationId?: string
  configId?: string
}

/** Create a key in the selected configuration and display its secret once. */
export function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  organizationId,
  configId
}: CreateApiKeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: apiKeyLocalization, keyExpiration } =
    useAuthPlugin(apiKeyPlugin)
  const colors = useThemeColors()

  const {
    mutateAsync: createApiKey,
    reset,
    isPending: isCreating
  } = useCreateApiKey(authClient as ApiKeyAuthClient, {
    meta: { errorPresentation: "inline" }
  })

  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setKeyName(null)
      setSecretKey(null)
    }

    onOpenChange(open)
  }

  const form = useAuthForm({
    defaultValues: {
      name: "",
      expiration: keyExpiration
        ? String(keyExpiration.defaultInterval ?? "never")
        : "never"
    },
    onSubmit: async ({ value }) => {
      const { expiration } = value
      const trimmedName = value.name.trim()

      const expiresIn =
        expiration !== "never" && keyExpiration
          ? apiKeyExpirationDaysToSeconds(Number(expiration))
          : undefined
      const payload =
        trimmedName || organizationId || configId || expiresIn
          ? {
              ...(expiresIn ? { expiresIn } : {}),
              ...(configId ? { configId } : {}),
              ...(trimmedName ? { name: trimmedName } : {}),
              ...(organizationId
                ? { organizationId, configId: configId ?? "organization" }
                : {})
            }
          : undefined

      await createApiKey(payload, {
        onSuccess: (result) => {
          handleOpenChange(false)
          setKeyName(trimmedName)
          setSecretKey(result.key)
          setIsNewKeyDialogOpen(true)
          reset()
        }
      })
    }
  })

  return (
    <>
      <AlertDialog isOpen={isOpen} onOpenChange={handleOpenChange}>
        <form.AppForm>
          <form.AuthFormRoot serverErrorMessage={localization.errors.generic}>
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="default">
                <Key width={20} height={20} color={colors.foreground} />
              </AlertDialog.Icon>

              <AlertDialog.Heading>
                {apiKeyLocalization.createApiKey}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>
              <Txt className="text-sm text-muted">
                {apiKeyLocalization.apiKeysDescription}
              </Txt>

              <form.AppField name="name">
                {(field) => (
                  <field.AuthFormTextField
                    className="mt-4"
                    isDisabled={isCreating}
                    label={apiKeyLocalization.name}
                    inputProps={{
                      placeholder: localization.settings.optional,
                      variant: "secondary"
                    }}
                  />
                )}
              </form.AppField>
              {keyExpiration ? (
                <form.Field name="expiration">
                  {(field) => (
                    <Select
                      label={apiKeyLocalization.expiration}
                      selectedKey={field.state.value}
                      onSelectionChange={field.handleChange}
                      isDisabled={isCreating}
                      options={[
                        ...keyExpiration.intervals.map((days) => ({
                          key: String(days),
                          label: `${days} ${days === 1 ? apiKeyLocalization.day : apiKeyLocalization.days}`
                        })),
                        ...(keyExpiration.allowNever
                          ? [{ key: "never", label: apiKeyLocalization.never }]
                          : [])
                      ]}
                    />
                  )}
                </form.Field>
              ) : null}
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button
                variant="tertiary"
                isDisabled={isCreating}
                onPress={() => handleOpenChange(false)}
              >
                {localization.settings.cancel}
              </Button>

              <form.AuthFormSubmitButton isPending={isCreating}>
                {apiKeyLocalization.createApiKey}
              </form.AuthFormSubmitButton>
            </AlertDialog.Footer>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialog>

      <NewApiKeyDialog
        isOpen={isNewKeyDialogOpen}
        onOpenChange={(open) => {
          setIsNewKeyDialogOpen(open)
          if (!open) {
            setSecretKey(null)
            setKeyName(null)
          }
        }}
        secretKey={secretKey}
        name={keyName}
      />
    </>
  )
}
