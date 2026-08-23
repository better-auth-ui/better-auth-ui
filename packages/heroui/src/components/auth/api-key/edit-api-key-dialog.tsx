import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateApiKey } from "@better-auth-ui/react/plugins/api-key"
import {
  AlertDialog,
  Button,
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import type { FormEvent } from "react"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"

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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    updateApiKey.mutate({
      keyId: apiKey.id,
      configId: apiKey.configId,
      name: String(formData.get("name") ?? "").trim()
    })
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={submit}>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading>{labels.editApiKey}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="overflow-visible">
              <div className="flex flex-col gap-4">
                <TextField name="name">
                  <Label>{labels.name}</Label>
                  <Input defaultValue={apiKey.name ?? ""} variant="secondary" />
                </TextField>
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
              <Button isPending={updateApiKey.isPending} type="submit">
                {updateApiKey.isPending && (
                  <Spinner color="current" size="sm" />
                )}
                {localization.settings.saveChanges}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
