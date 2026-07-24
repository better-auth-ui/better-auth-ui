"use client"

import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Fingerprint, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardContent className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <Fingerprint className="size-4.5" />
        </div>

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium leading-tight">
            {passkeyName}
          </span>

          <span className="text-muted-foreground text-xs">
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
      </CardContent>
    </Card>
  )
}
