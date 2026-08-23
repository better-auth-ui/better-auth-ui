import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useUpdateApiKey } from "@better-auth-ui/solid/plugins/api-key"
import { Show } from "solid-js"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
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
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"

export function EditApiKeyDialog(props: {
  apiKey: ListedApiKey
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth<ApiKeyAuthClient>()
  const config = useAuthPlugin(apiKeyPlugin)
  const labels = config.localization

  const updateApiKey = useUpdateApiKey(auth.authClient, () => ({
    onSuccess: () => props.onOpenChange(false)
  }))
  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    updateApiKey.mutate({
      keyId: props.apiKey.id,
      configId: props.apiKey.configId,
      name: String(formData.get("name") ?? "").trim()
    })
  }
  const updateErrorMessage = () =>
    updateApiKey.error?.error?.message ?? updateApiKey.error?.message
  return (
    <DialogContent>
      <form class="flex flex-col gap-6" onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>{labels.editApiKey}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel for={`api-key-name-${props.apiKey.id}`}>
              {labels.name}
            </FieldLabel>
            <Input
              id={`api-key-name-${props.apiKey.id}`}
              name="name"
              value={props.apiKey.name ?? ""}
            />
          </Field>
          <Show when={updateErrorMessage()}>
            <FieldError>{updateErrorMessage()}</FieldError>
          </Show>
        </FieldGroup>
        <DialogFooter>
          <DialogClose as={Button} variant="outline">
            {auth.localization.settings.cancel}
          </DialogClose>
          <Button disabled={updateApiKey.isPending} type="submit">
            {auth.localization.settings.saveChanges}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
