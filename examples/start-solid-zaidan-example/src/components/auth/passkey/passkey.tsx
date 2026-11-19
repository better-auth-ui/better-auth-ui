import { useAuth } from "@better-auth-ui/solid"
import { FingerprintPattern, Pencil, X } from "lucide-solid"
import { createSignal } from "solid-js"
import { DeletePasskeyDialog } from "@/components/auth/passkey/delete-passkey-dialog"
import { passkeyLabels } from "@/components/auth/passkey/passkey-localization"
import type { ListedPasskey } from "@/components/auth/settings/shared/types"
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { RenamePasskeyDialog } from "./rename-passkey-dialog"

export function Passkey(props: { passkey: ListedPasskey }) {
  const auth = useAuth()
  const labels = () => passkeyLabels(auth)
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const [renameOpen, setRenameOpen] = createSignal(false)
  const passkeyName = () => props.passkey.name || labels().passkey

  return (
    <Item>
      <ItemMedia variant="icon">
        <FingerprintPattern />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{passkeyName()}</ItemTitle>
        <ItemDescription>
          {new Date(props.passkey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Dialog
          open={renameOpen()}
          onOpenChange={(value) => {
            setRenameOpen(value)
          }}
        >
          <DialogTrigger as={Button} size="sm" variant="outline">
            <Pencil />
            {labels().renamePasskey}
          </DialogTrigger>
          <RenamePasskeyDialog
            open={renameOpen()}
            onOpenChange={(value) => {
              setRenameOpen(value)
            }}
            passkey={props.passkey}
          />
        </Dialog>
        <AlertDialog
          open={deleteOpen()}
          onOpenChange={(value) => {
            setDeleteOpen(value)
          }}
        >
          <AlertDialogTrigger
            as={Button}
            aria-label={labels().deletePasskey.replace(
              "{{name}}",
              passkeyName()
            )}
            size="sm"
            variant="outline"
          >
            <X />
            {auth.localization.settings.delete}
          </AlertDialogTrigger>
          <DeletePasskeyDialog
            onOpenChange={(value) => {
              setDeleteOpen(value)
            }}
            passkey={props.passkey}
          />
        </AlertDialog>
      </ItemActions>
    </Item>
  )
}
