import { passkeyLocalization } from "@better-auth-ui/core/plugins"
import { useAuth } from "@better-auth-ui/solid"
import { Fingerprint, X } from "lucide-solid"
import { createSignal } from "solid-js"
import { DeletePasskeyDialog } from "@/components/auth/passkey/delete-passkey-dialog"
import type { ListedPasskey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

export function Passkey(props: { passkey: ListedPasskey }) {
  const auth = useAuth()
  const [deleteOpen, setDeleteOpen] = createSignal(false)
  const passkeyName = () => props.passkey.name || passkeyLocalization.passkey

  return (
    <div class="flex items-center gap-3 p-4 text-sm">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Fingerprint class="size-4.5" />
      </div>

      <div class="flex min-w-0 flex-col">
        <span class="truncate font-medium leading-tight">{passkeyName()}</span>
        <span class="text-muted-foreground text-xs">
          {new Date(props.passkey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </span>
      </div>

      <Dialog open={deleteOpen()} onOpenChange={setDeleteOpen}>
        <DialogTrigger
          as={Button}
          aria-label={passkeyLocalization.deletePasskey.replace(
            "{{name}}",
            passkeyName()
          )}
          class="ml-auto shrink-0"
          size="sm"
          variant="outline"
        >
          <X />
          {auth.localization.settings.delete}
        </DialogTrigger>
        <DeletePasskeyDialog
          onOpenChange={setDeleteOpen}
          passkey={props.passkey}
        />
      </Dialog>
    </div>
  )
}
