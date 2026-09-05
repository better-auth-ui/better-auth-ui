import { validateStringLength } from "@better-auth-ui/core"
import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth } from "@better-auth-ui/solid"
import { useUpdatePasskey } from "@better-auth-ui/solid/plugins/passkey"
import { createEffect } from "solid-js"
import { passkeyLabels } from "@/components/auth/passkey/passkey-localization"
import type { ListedPasskey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createAuthForm } from "../auth-form"

export function RenamePasskeyDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}) {
  const auth = useAuth<PasskeyAuthClient>()
  const labels = () => passkeyLabels(auth)
  const updatePasskey = useUpdatePasskey(auth.authClient, () => ({
    onSuccess: () => props.onOpenChange(false)
  }))
  const form = createAuthForm(() => ({
    defaultValues: { name: props.passkey.name ?? "" },
    onSubmit: async ({ value }) => {
      await updatePasskey.mutateAsync({
        id: props.passkey.id,
        name: value.name.trim()
      })
    }
  }))
  createEffect(() => {
    if (props.open) form.setFieldValue("name", props.passkey.name ?? "")
  })

  return (
    <DialogContent>
      <form.AppForm>
        <form.AuthFormRoot class="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{labels().renamePasskey}</DialogTitle>
          </DialogHeader>
          <form.AppField
            name="name"
            validators={{
              onChange: ({ value }) =>
                validateStringLength(value, {
                  requiredMessage: auth.localization.auth.fieldRequired,
                  trim: true
                })
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel for={`passkey-name-${props.passkey.id}`}>
                  {labels().name}
                </FieldLabel>
                <Input
                  id={`passkey-name-${props.passkey.id}`}
                  autofocus
                  name={field().name}
                  value={field().state.value}
                  onBlur={field().handleBlur}
                  onInput={(event) =>
                    field().handleChange(event.currentTarget.value)
                  }
                />
                <field.AuthFormFieldError />
              </Field>
            )}
          </form.AppField>
          <DialogFooter>
            <DialogClose as={Button} type="button" variant="outline">
              {auth.localization.settings.cancel}
            </DialogClose>
            <form.AuthFormSubmitButton
              isPending={updatePasskey.isPending}
              disabled={updatePasskey.isPending}
            >
              {auth.localization.settings.saveChanges}
            </form.AuthFormSubmitButton>
          </DialogFooter>
          <form.AuthFormServerError />
        </form.AuthFormRoot>
      </form.AppForm>
    </DialogContent>
  )
}
