import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListPasskeys } from "@better-auth-ui/react/plugins/passkey"
import { Button, Card, type CardProps, cn } from "@heroui/react"
import { useState } from "react"

import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"
import { AddPasskeyDialog } from "./add-passkey-dialog"
import { Passkey } from "./passkey"
import { PasskeySkeleton } from "./passkey-skeleton"
import { PasskeysEmpty } from "./passkeys-empty"

export type PasskeysProps = {
  className?: string
  variant?: CardProps["variant"]
}

export function Passkeys({
  className,
  variant,
  ...props
}: PasskeysProps & Omit<CardProps, "children">) {
  const { authClient } = useAuth()
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  const { data: passkeys, isPending } = useListPasskeys(
    authClient as PasskeyAuthClient
  )

  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold truncate">
          {passkeyLocalization.passkeys}
        </h2>

        <Button
          className="shrink-0"
          size="sm"
          isDisabled={isPending}
          onPress={() => setAddOpen(true)}
        >
          {passkeyLocalization.addPasskey}
        </Button>
      </div>

      <Card variant={variant} {...props}>
        <Card.Content>
          {isPending ? (
            <PasskeySkeleton />
          ) : !passkeys?.length ? (
            <PasskeysEmpty onAddPress={() => setAddOpen(true)} />
          ) : (
            passkeys.map((passkey, index) => (
              <div key={passkey.id}>
                {index > 0 && (
                  <div className="border-b border-dashed -mx-4 my-4" />
                )}

                <Passkey passkey={passkey} />
              </div>
            ))
          )}
        </Card.Content>
      </Card>

      <AddPasskeyDialog isOpen={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
