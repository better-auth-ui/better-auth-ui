"use client"
import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDeletePasskey } from "@better-auth-ui/react/plugins/passkey"
import { Fingerprint } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
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
  const { authClient, localization } = useAuth<PasskeyAuthClient>()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)
  const passkeyName = passkey.name || passkeyLocalization.passkey
  const previewId = `delete-passkey-preview-${passkey.id}`
  const { mutate: deletePasskey, isPending: isDeleting } = useDeletePasskey(
    authClient,
    {
      onSuccess: () => onOpenChange(false)
    }
  )
  return (
    <AlertDialog isOpen={open} onOpenChange={onOpenChange}>
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
        <FieldLabel htmlFor={previewId} id={`${previewId}-label`}>
          {passkey.name || passkeyLocalization.passkey}
        </FieldLabel>

        <Input id={previewId} value={passkeyName} readOnly disabled />
      </Field>

      <AlertDialogFooter>
        <AlertDialogCancel isDisabled={isDeleting}>
          {localization.settings.cancel}
        </AlertDialogCancel>

        <Button
          type="button"
          variant="destructive"
          isDisabled={isDeleting}
          onPress={() => deletePasskey({ id: passkey.id })}
        >
          {isDeleting && <Spinner />}

          {passkeyLocalization.deletePasskeyTitle}
        </Button>
      </AlertDialogFooter>
    </AlertDialog>
  )
}
