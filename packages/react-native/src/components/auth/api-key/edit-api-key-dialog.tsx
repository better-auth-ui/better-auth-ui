import { validateStringLength } from "@better-auth-ui/core"
import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateApiKey } from "@better-auth-ui/react/plugins/api-key"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { useAuthForm } from "../auth-form"
export function EditApiKeyDialog({
  apiKey,
  configId,
  onClose
}: {
  apiKey: ListedApiKey
  configId?: string
  onClose: () => void
}) {
  const { authClient, localization: common } = useAuth()
  const { localization } = useAuthPlugin(apiKeyPlugin)
  const update = useUpdateApiKey(authClient as ApiKeyAuthClient)
  const form = useAuthForm({
    defaultValues: { name: apiKey.name ?? "" },
    onSubmit: async ({ value }) => {
      await update.mutateAsync({
        keyId: apiKey.id,
        configId,
        name: value.name.trim()
      })
      onClose()
    }
  })
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !update.isPending) onClose()
      }}
    >
      <AlertDialog.CloseTrigger />
      <form.AppForm>
        <form.AuthFormRoot>
          <AlertDialog.Header>
            <AlertDialog.Heading>{localization.editApiKey}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <form.AppField
              name="name"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    requiredMessage: common.auth.fieldRequired,
                    trim: true
                  })
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  label={localization.name}
                  isDisabled={update.isPending}
                />
              )}
            </form.AppField>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button
              variant="tertiary"
              isDisabled={update.isPending}
              onPress={onClose}
            >
              {common.settings.cancel}
            </Button>
            <form.AuthFormSubmitButton isPending={update.isPending}>
              {common.settings.saveChanges}
            </form.AuthFormSubmitButton>
          </AlertDialog.Footer>
        </form.AuthFormRoot>
      </form.AppForm>
    </AlertDialog>
  )
}
