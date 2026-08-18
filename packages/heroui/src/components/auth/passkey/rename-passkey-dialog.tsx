import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdatePasskey } from "@better-auth-ui/react/plugins/passkey"
import {
  AlertDialog,
  Button,
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { type FormEvent, useEffect, useState } from "react"
import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"
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
  const [name, setName] = useState(passkey.name ?? "")

  useEffect(() => {
    if (isOpen) setName(passkey.name ?? "")
  }, [isOpen, passkey.name])

  const updatePasskey = useUpdatePasskey(authClient as PasskeyAuthClient, {
    onSuccess: () => onOpenChange(false)
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextName = name.trim()
    if (nextName) updatePasskey.mutate({ id: passkey.id, name: nextName })
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={submit}>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading>{labels.renamePasskey}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <TextField isDisabled={updatePasskey.isPending}>
                <Label>{labels.name}</Label>
                <Input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  variant="secondary"
                  required
                />
              </TextField>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                {localization.settings.cancel}
              </Button>
              <Button
                isDisabled={!name.trim()}
                isPending={updatePasskey.isPending}
                type="submit"
              >
                {updatePasskey.isPending && (
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
