import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useAddPasskey } from "@better-auth-ui/react/plugins/passkey"
import { Fingerprint } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import type { SyntheticEvent } from "react"

import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"

export type AddPasskeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPasskeyDialog({
  isOpen,
  onOpenChange
}: AddPasskeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  const { mutate: addPasskey, isPending: isAdding } = useAddPasskey(
    authClient as PasskeyAuthClient
  )

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string)?.trim()

    addPasskey(name ? { name } : undefined, {
      onSuccess: () => handleOpenChange(false)
    })
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={handleSubmit}>
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="default">
                <Fingerprint />
              </AlertDialog.Icon>

              <AlertDialog.Heading>
                {passkeyLocalization.addPasskey}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="overflow-visible">
              <p className="text-muted text-sm">
                {passkeyLocalization.passkeysDescription}
              </p>

              <TextField
                className="mt-4"
                id="name"
                name="name"
                isDisabled={isAdding}
              >
                <Label>{passkeyLocalization.name}</Label>

                <Input
                  autoFocus
                  placeholder={localization.settings.optional}
                  variant="secondary"
                />

                <FieldError />
              </TextField>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={isAdding}>
                {localization.settings.cancel}
              </Button>

              <Button type="submit" isPending={isAdding}>
                {isAdding && <Spinner color="current" size="sm" />}

                {passkeyLocalization.addPasskey}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
