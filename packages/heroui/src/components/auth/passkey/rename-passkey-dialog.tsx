import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdatePasskey } from "@better-auth-ui/react/plugins/passkey"
import {
  AlertDialog,
  Button,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { useEffect } from "react"
import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"
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
}) {
  const { authClient, localization } = useAuth()
  const { localization: labels } = useAuthPlugin(passkeyPlugin)
  const updatePasskey = useUpdatePasskey(authClient as PasskeyAuthClient, {
    onSuccess: () => onOpenChange(false)
  })
  const form = useAuthForm({
    defaultValues: { name: passkey.name ?? "" },
    onSubmit: ({ value }) => {
      const nextName = value.name.trim()
      if (nextName) updatePasskey.mutate({ id: passkey.id, name: nextName })
    }
  })
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
                      <Input autoFocus variant="secondary" required />
                    </TextField>
                  )}
                </form.AppField>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  {localization.settings.cancel}
                </Button>
                <form.AuthFormSubmitButton
                  isDisabled={
                    !form.state.values.name.trim() || updatePasskey.isPending
                  }
                >
                  {updatePasskey.isPending && (
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
