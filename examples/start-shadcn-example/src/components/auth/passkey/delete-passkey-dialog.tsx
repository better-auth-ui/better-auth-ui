"use client"

import {
  type PasskeyAuthClient,
  useAuth,
  useAuthPlugin,
  useDeletePasskey
} from "@better-auth-ui/react"
import { Fingerprint } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"

export type ListedPasskey = {
  id: string
  name?: string | null
  createdAt: Date
}

export type DeletePasskeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}

export function DeletePasskeyDialog({
  open,
  onOpenChange,
  passkey
}: DeletePasskeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  const passkeyName = passkey.name || passkeyLocalization.passkey
  const previewId = `delete-passkey-preview-${passkey.id}`

  const { mutate: deletePasskey, isPending: isDeleting } = useDeletePasskey(
    authClient as PasskeyAuthClient,
    {
      onSuccess: () => onOpenChange(false)
    }
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Fingerprint />
          </AlertDialogMedia>

          <AlertDialogTitle>
            {passkeyLocalization.deletePasskeyTitle}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {passkeyLocalization.deletePasskeyWarning}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field>
          <FieldLabel htmlFor={previewId}>
            {passkey.name || passkeyLocalization.passkey}
          </FieldLabel>

          <Input id={previewId} value={passkeyName} readOnly disabled />
        </Field>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {localization.settings.cancel}
          </AlertDialogCancel>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => deletePasskey({ id: passkey.id })}
          >
            {isDeleting && <Spinner />}

            {passkeyLocalization.deletePasskeyTitle}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
