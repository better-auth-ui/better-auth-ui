import { passkeyLocalization } from "@better-auth-ui/core/plugins"
import {
  deletePasskeyOptions,
  type PasskeyAuthClient,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Fingerprint } from "lucide-solid"
import type { ListedPasskey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DeletePasskeyDialog(props: {
  onOpenChange: (open: boolean) => void
  passkey: ListedPasskey
}) {
  const auth = useAuth()
  const passkeyName = () => props.passkey.name || passkeyLocalization.passkey
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
    <DialogContent>
      <DialogHeader>
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <Fingerprint class="size-4.5" />
        </div>
        <DialogTitle>{passkeyLocalization.deletePasskeyTitle}</DialogTitle>
        <DialogDescription>
          {passkeyLocalization.deletePasskeyWarning}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-2">
        <Label for={previewId()}>{passkeyName()}</Label>
        <Input disabled id={previewId()} readonly value={passkeyName()} />
      </div>

      <DialogFooter>
        <DialogClose
          as={Button}
          disabled={deletePasskey.isPending}
          type="button"
          variant="outline"
        >
          {auth.localization.settings.cancel}
        </DialogClose>
        <Button
          disabled={deletePasskey.isPending}
          onClick={deleteKey}
          type="button"
          variant="destructive"
        >
          {deletePasskey.isPending
            ? `${passkeyLocalization.deletePasskeyTitle}…`
            : passkeyLocalization.deletePasskeyTitle}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
