import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Fingerprint, Xmark } from "@gravity-ui/icons"
import { Button } from "@heroui/react"
import { useState } from "react"

import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"
import {
  DeletePasskeyDialog,
  type ListedPasskey
} from "./delete-passkey-dialog"
import { RenamePasskeyDialog } from "./rename-passkey-dialog"

export type PasskeyProps = {
  passkey: ListedPasskey
}

export function Passkey({ passkey }: PasskeyProps) {
  const { localization } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)

  const passkeyName = passkey.name || passkeyLocalization.passkey

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Fingerprint className="size-4.5" />
      </div>

      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium leading-tight">
          {passkeyName}
        </span>

        <span className="text-xs text-muted">
          {new Date(passkey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </span>
      </div>

      <Button
        className="ml-auto shrink-0"
        variant="outline"
        size="sm"
        onPress={() => setRenameOpen(true)}
      >
        {passkeyLocalization.renamePasskey}
      </Button>

      <Button
        className="shrink-0"
        variant="outline"
        size="sm"
        onPress={() => setDeleteOpen(true)}
        aria-label={passkeyLocalization.deletePasskey.replace(
          "{{name}}",
          passkeyName
        )}
      >
        <Xmark />

        {localization.settings.delete}
      </Button>

      <DeletePasskeyDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        passkey={passkey}
      />
      <RenamePasskeyDialog
        isOpen={renameOpen}
        onOpenChange={setRenameOpen}
        passkey={passkey}
      />
    </div>
  )
}
