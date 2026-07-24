"use client"

import { useAuthPlugin } from "@better-auth-ui/react"
import { Fingerprint } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"

export type PasskeysEmptyProps = {
  onAddPress: () => void
}

export function PasskeysEmpty({ onAddPress }: PasskeysEmptyProps) {
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
          <Fingerprint className="size-4.5" />
        </div>

        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-semibold">
            {passkeyLocalization.noPasskeys}
          </p>

          <p className="text-muted-foreground text-xs">
            {passkeyLocalization.passkeysDescription}
          </p>
        </div>

        <Button size="sm" onClick={onAddPress}>
          {passkeyLocalization.addPasskey}
        </Button>
      </CardContent>
    </Card>
  )
}
