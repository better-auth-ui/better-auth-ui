import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { Copy } from "lucide-solid"
import { For } from "solid-js"
import { toast } from "solid-sonner"

import { Button } from "@/components/ui/button"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"

export type BackupCodesProps = {
  codes: string[]
}

/**
 * One-time display of freshly generated backup codes.
 *
 * The codes are never persisted anywhere on the client — they live in the
 * calling component's state until the dialog closes, which is why the copy
 * button matters.
 */
export function BackupCodes(props: BackupCodesProps) {
  const auth = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)

  // Clipboard writes reject on insecure origins and when the user denies the
  // permission, so the codes stay on screen and the toast tells them to copy
  // by hand rather than leaving a rejected promise behind.
  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(props.codes.join("\n"))
      toast.success(twoFactorLocalization.backupCodesCopied)
    } catch {
      toast.error(twoFactorLocalization.backupCodesCopyFailed)
    }
  }

  return (
    <div class="flex flex-col gap-3">
      <p class="text-muted-foreground text-sm">
        {twoFactorLocalization.backupCodesDescription}
      </p>

      <ul class="grid grid-cols-2 gap-2 rounded-md border bg-muted/40 p-4 font-mono text-sm">
        <For each={props.codes}>
          {(backupCode) => <li class="tracking-wide">{backupCode}</li>}
        </For>
      </ul>

      <Button onClick={copyCodes} size="sm" type="button" variant="outline">
        <Copy />
        {auth.localization.settings.copyToClipboard}
      </Button>
    </div>
  )
}
