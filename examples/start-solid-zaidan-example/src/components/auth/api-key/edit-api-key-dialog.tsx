import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useUpdateApiKey } from "@better-auth-ui/solid/plugins/api-key"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { createAuthForm } from "../auth-form"

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
  const form = createAuthForm(() => ({
    defaultValues: { name: props.apiKey.name ?? "" },
    onSubmit: async ({ value }) => {
      await updateApiKey.mutateAsync({
        keyId: props.apiKey.id,
        configId: props.apiKey.configId,
        name: value.name.trim()
      })
    }
  }))
  return (
    <DialogContent>
      <form.AppForm>
        <form.AuthFormRoot class="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{labels.editApiKey}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <form.AppField name="name">
              {(field) => (
                <Field>
                  <FieldLabel for={`api-key-name-${props.apiKey.id}`}>
                    {labels.name}
                  </FieldLabel>
                  <Input
                    id={`api-key-name-${props.apiKey.id}`}
                    name={field().name}
                    value={field().state.value}
                    onBlur={field().handleBlur}
                    onInput={(event) =>
                      field().handleChange(event.currentTarget.value)
                    }
                  />
                </Field>
              )}
            </form.AppField>
            <form.AuthFormServerError />
          </FieldGroup>
          <DialogFooter>
            <DialogClose as={Button} variant="outline">
              {auth.localization.settings.cancel}
            </DialogClose>
            <form.AuthFormSubmitButton disabled={updateApiKey.isPending}>
              {auth.localization.settings.saveChanges}
            </form.AuthFormSubmitButton>
          </DialogFooter>
        </form.AuthFormRoot>
      </form.AppForm>
    </DialogContent>
  )
}
