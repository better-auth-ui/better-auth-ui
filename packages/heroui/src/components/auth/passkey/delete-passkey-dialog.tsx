import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeletePasskey } from "@better-auth-ui/react/plugins/passkey"
import { Fingerprint } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"

import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"

export type ListedPasskey = {
  id: string
  name?: string | null
  createdAt: Date
}

export type DeletePasskeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}

export function DeletePasskeyDialog({
  isOpen,
  onOpenChange,
  passkey
}: DeletePasskeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  const passkeyName = passkey.name || passkeyLocalization.passkey

  const { mutate: deletePasskey, isPending: isDeleting } = useDeletePasskey(
    authClient as PasskeyAuthClient,
    {
      onSuccess: () => onOpenChange(false)
    }
  )

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />

          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <Fingerprint />
            </AlertDialog.Icon>

            <AlertDialog.Heading>
              {passkeyLocalization.deletePasskeyTitle}
            </AlertDialog.Heading>
          </AlertDialog.Header>

          <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
            <p className="text-muted text-sm">
              {passkeyLocalization.deletePasskeyWarning}
            </p>

            <TextField value={passkeyName} variant="secondary">
              <Label>{passkey.name || passkeyLocalization.passkey}</Label>

              <Input readOnly />
            </TextField>
          </AlertDialog.Body>

          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={isDeleting}>
              {localization.settings.cancel}
            </Button>

            <Button
              variant="danger"
              onPress={() => deletePasskey({ id: passkey.id })}
              isPending={isDeleting}
            >
              {isDeleting && <Spinner color="current" size="sm" />}

              {passkeyLocalization.deletePasskeyTitle}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
