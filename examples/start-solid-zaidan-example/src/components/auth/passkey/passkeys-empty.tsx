import { passkeyLocalization } from "@better-auth-ui/core/plugins"
import { Fingerprint } from "lucide-solid"
import { Button } from "@/components/ui/button"

export function PasskeysEmpty(props: { onAddPress: () => void }) {
  return (
    <div class="flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div class="flex size-10 items-center justify-center rounded-md bg-muted">
        <Fingerprint class="size-4.5" />
      </div>

      <div class="flex flex-col items-center justify-center gap-1">
        <p class="font-semibold text-sm">{passkeyLocalization.noPasskeys}</p>
        <p class="text-muted-foreground text-xs">
          {passkeyLocalization.passkeysDescription}
        </p>
      </div>

      <Button onClick={props.onAddPress} size="sm" type="button">
        {passkeyLocalization.addPasskey}
      </Button>
    </div>
  )
}
