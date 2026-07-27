import {
  downloadTextFile,
  formatBackupCodesText,
  printTextFile
} from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { Copy, Download, Printer } from "lucide-solid"
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
 * The codes are never persisted anywhere on the client. They live in the
 * calling component's state until the dialog closes, so the save actions
 * matter.
 */
export function BackupCodes(props: BackupCodesProps) {
  const auth = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const getBackupCodesText = () =>
    formatBackupCodesText(
      props.codes,
      twoFactorLocalization,
      window.location.origin
    )

  // Clipboard writes reject on insecure origins and when the user denies the
  // permission, so the codes stay on screen and the toast tells them to copy
  // by hand rather than leaving a rejected promise behind.
  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(getBackupCodesText())
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

      <div class="flex flex-wrap gap-2">
        <Button onClick={copyCodes} size="sm" type="button" variant="outline">
          <Copy />
          {auth.localization.settings.copyToClipboard}
        </Button>

        <Button
          onClick={() =>
            downloadTextFile(getBackupCodesText(), "backup-codes.txt")
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <Download />
          {twoFactorLocalization.downloadBackupCodes}
        </Button>

        <Button
          onClick={() => printTextFile(getBackupCodesText())}
          size="sm"
          type="button"
          variant="outline"
        >
          <Printer />
          {twoFactorLocalization.printBackupCodes}
        </Button>
      </div>
    </div>
  )
}
