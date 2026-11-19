import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdatePasskey } from "@better-auth-ui/react/plugins/passkey"
import { AlertDialog, Button, Input, Label, TextField } from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useEffect, type JSX } from "react"
import { passkeyPlugin } from "@better-auth-ui/core/plugins/passkey"
import { useAuthForm } from "../auth-form"
import type { ListedPasskey } from "./delete-passkey-dialog"

export function RenamePasskeyDialog({
  isOpen,
  onOpenChange,
  passkey
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}): JSX.Element {
  const { authClient, localization } = useAuth<PasskeyAuthClient>()
  const { localization: labels } = useAuthPlugin(passkeyPlugin)
  const updatePasskey = useUpdatePasskey(authClient, {
    onSuccess: () => {
      onOpenChange(false)
    }
  })
  const form = useAuthForm({
    defaultValues: { name: passkey.name ?? "" },
    onSubmit: async ({ value }) => {
      const nextName = value.name.trim()
      if (nextName) {
        await updatePasskey.mutateAsync({ id: passkey.id, name: nextName })
      }
    }
  })
  const nameIsEmpty = useSelector(
    form.store,
    (state) => state.values.name.trim().length === 0
  )
  useEffect(() => {
    if (isOpen) form.setFieldValue("name", passkey.name ?? "")
  }, [form.setFieldValue, isOpen, passkey.name])

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <form.AppForm>
            <form.AuthFormRoot>
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Heading>
                  {labels.renamePasskey}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <form.AppField name="name">
                  {(field) => (
                    <TextField
                      isDisabled={updatePasskey.isPending}
                      value={field.state.value}
                      onChange={field.handleChange}
                      onBlur={field.handleBlur}
                    >
                      <Label>{labels.name}</Label>
                      <Input variant="secondary" required />
                    </TextField>
                  )}
                </form.AppField>
                <form.AuthFormServerError />
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  {localization.settings.cancel}
                </Button>
                <form.AuthFormSubmitButton
                  isPending={updatePasskey.isPending}
                  isDisabled={nameIsEmpty || updatePasskey.isPending}
                >
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
