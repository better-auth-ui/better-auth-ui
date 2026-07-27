import {
  deletePasskeyOptions,
  type PasskeyAuthClient,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Fingerprint } from "lucide-solid"
import { passkeyLabels } from "@/components/auth/passkey/passkey-localization"
import type { ListedPasskey } from "@/components/auth/settings/shared/types"
import {
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

export function DeletePasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}) {
  const auth = useAuth()
  const labels = () => passkeyLabels(auth)
  const passkeyName = () => props.passkey.name || labels().passkey
  const previewId = () => `delete-passkey-preview-${props.passkey.id}`
  const deletePasskey = createMutation(() => ({
    ...deletePasskeyOptions(auth.authClient as PasskeyAuthClient),
    onSuccess: () => props.onOpenChange(false)
  }))

  const deleteKey = () => {
    deletePasskey.mutate({
      id: props.passkey.id
    } as Parameters<typeof deletePasskey.mutate>[0])
  }

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <Fingerprint />
        </AlertDialogMedia>
        <AlertDialogTitle>{labels().deletePasskeyTitle}</AlertDialogTitle>
        <AlertDialogDescription>
          {labels().deletePasskeyWarning}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <Field>
        <FieldLabel for={previewId()}>{passkeyName()}</FieldLabel>
        <Input disabled id={previewId()} readonly value={passkeyName()} />
      </Field>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={deletePasskey.isPending} type="button">
          {auth.localization.settings.cancel}
        </AlertDialogCancel>
        <Button
          disabled={deletePasskey.isPending}
          onClick={deleteKey}
          type="button"
          variant="destructive"
        >
          {deletePasskey.isPending ? <Spinner /> : null}
          {labels().deletePasskeyTitle}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
