import { useAuthPlugin } from "@better-auth-ui/react"
import { Fingerprint } from "@gravity-ui/icons"
import { Button } from "@heroui/react"

import { passkeyPlugin } from "@better-auth-ui/core/plugins/passkey"

export type PasskeysEmptyProps = {
  onAddPress: () => void
}

export function PasskeysEmpty({ onAddPress }: PasskeysEmptyProps) {
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin)

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
        <Fingerprint className="size-4.5" />
      </div>

      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm font-semibold">
          {passkeyLocalization.noPasskeys}
        </p>

        <p className="text-muted text-xs">
          {passkeyLocalization.passkeysDescription}
        </p>
      </div>

      <Button size="sm" onPress={onAddPress}>
        {passkeyLocalization.addPasskey}
      </Button>
    </div>
  )
}
