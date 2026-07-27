"use client"

import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Fingerprint, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"

import {
  DeletePasskeyDialog,
  type ListedPasskey
} from "./delete-passkey-dialog"

export type PasskeyProps = {
  passkey: ListedPasskey
}

export function Passkey({ passkey }: PasskeyProps) {
  const { localization } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const passkeyName = passkey.name || passkeyLocalization.passkey

  return (
    <Item>
      <ItemMedia variant="icon">
        <Fingerprint />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{passkeyName}</ItemTitle>
        <ItemDescription>
          {new Date(passkey.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          aria-label={passkeyLocalization.deletePasskey.replace(
            "{{name}}",
            passkeyName
          )}
        >
          <X />

          {localization.settings.delete}
        </Button>

        <DeletePasskeyDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          passkey={passkey}
        />
      </ItemActions>
    </Item>
  )
}
