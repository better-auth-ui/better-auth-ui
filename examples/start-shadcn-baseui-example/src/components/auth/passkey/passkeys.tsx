"use client"

import {
  type PasskeyAuthClient,
  useAuth,
  useAuthPlugin,
  useListPasskeys
} from "@better-auth-ui/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { cn } from "@/lib/utils"

import { AddPasskeyDialog } from "./add-passkey-dialog"
import { Passkey } from "./passkey"
import { PasskeySkeleton } from "./passkey-skeleton"
import { PasskeysEmpty } from "./passkeys-empty"

export type PasskeysProps = {
  className?: string
}

export function Passkeys({ className }: PasskeysProps) {
  const { authClient } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  const { data: passkeys, isPending } = useListPasskeys(
    authClient as PasskeyAuthClient
  )

  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <h2 className="truncate text-sm font-semibold">
          {passkeyLocalization.passkeys}
        </h2>

        <Button
          className="shrink-0"
          size="sm"
          disabled={isPending}
          onClick={() => setAddOpen(true)}
        >
          {passkeyLocalization.addPasskey}
        </Button>
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          {isPending ? (
            <PasskeySkeleton />
          ) : !passkeys?.length ? (
            <PasskeysEmpty onAddPress={() => setAddOpen(true)} />
          ) : (
            passkeys.map((passkey, index) => (
              <div key={passkey.id}>
                {index > 0 && <Separator />}

                <Passkey passkey={passkey} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AddPasskeyDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
