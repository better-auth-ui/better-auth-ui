import {
  downloadTextFile,
  formatBackupCodesText,
  printTextFile
} from "@better-auth-ui/core"
import {
  createCopyToClipboard,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/solid"
import { Check, Copy, Download, Printer } from "lucide-solid"
import { For, Show } from "solid-js"
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
  const { copied, copy } = createCopyToClipboard({
    onError: () => toast.error(twoFactorLocalization.backupCodesCopyFailed)
  })
  const getBackupCodesText = () =>
    formatBackupCodesText(
      props.codes,
      twoFactorLocalization,
      window.location.origin
    )

  const copyCodes = () => copy(getBackupCodesText())

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
        <Button
          aria-label={
            copied()
              ? twoFactorLocalization.backupCodesCopied
              : auth.localization.settings.copyToClipboard
          }
          onClick={copyCodes}
          size="sm"
          type="button"
          variant="outline"
        >
          <Show fallback={<Copy />} when={copied()}>
            <Check />
          </Show>
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
