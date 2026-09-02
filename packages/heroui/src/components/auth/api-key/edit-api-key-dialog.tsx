import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateApiKey } from "@better-auth-ui/react/plugins/api-key"
import {
  AlertDialog,
  Button,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { useEffect } from "react"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { useAuthForm } from "../auth-form"

export function EditApiKeyDialog({
  apiKey,
  isOpen,
  onOpenChange
}: {
  apiKey: ListedApiKey
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { authClient, localization } = useAuth<ApiKeyAuthClient>()
  const { localization: labels } = useAuthPlugin(apiKeyPlugin)

  const updateApiKey = useUpdateApiKey(authClient, {
    onSuccess: () => onOpenChange(false)
  })

  const form = useAuthForm({
    defaultValues: { name: apiKey.name ?? "" },
    onSubmit: ({ value }) => {
      updateApiKey.mutate({
        keyId: apiKey.id,
        configId: apiKey.configId,
        name: value.name.trim()
      })
    }
  })
  useEffect(() => {
    if (isOpen) form.setFieldValue("name", apiKey.name ?? "")
  }, [apiKey.name, form.setFieldValue, isOpen])

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <form.AppForm>
            <form.AuthFormRoot>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Heading>{labels.editApiKey}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body className="overflow-visible">
                <div className="flex flex-col gap-4">
                  <form.AppField name="name">
                    {(field) => (
                      <TextField
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                      >
                        <Label>{labels.name}</Label>
                        <Input variant="secondary" />
                      </TextField>
                    )}
                  </form.AppField>
                </div>
                {updateApiKey.error && (
                  <p className="mt-3 text-sm text-danger" role="alert">
                    {updateApiKey.error.error?.message ??
                      updateApiKey.error?.message}
                  </p>
                )}
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  {localization.settings.cancel}
                </Button>
                <form.AuthFormSubmitButton isDisabled={updateApiKey.isPending}>
                  {updateApiKey.isPending && (
                    <Spinner color="current" size="sm" />
                  )}
                  {localization.settings.saveChanges}
                </form.AuthFormSubmitButton>
              </AlertDialog.Footer>
            </form.AuthFormRoot>
          </form.AppForm>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
