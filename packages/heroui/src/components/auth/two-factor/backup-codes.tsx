import {
  downloadTextFile,
  formatBackupCodesText,
  printTextFile
} from "@better-auth-ui/core"
import {
  useAuth,
  useAuthPlugin,
  useCopyToClipboard
} from "@better-auth-ui/react"
import { ArrowDownToLine, Check, Copy, Printer } from "@gravity-ui/icons"
import { Button, toast } from "@heroui/react"

import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"

export type BackupCodesProps = {
  codes: string[]
}

/**
 * One-time display of freshly generated backup codes.
 *
 * The codes are never persisted anywhere on the client. They live in the
 * calling component's state until the dialog closes, so the save actions
 * matter.
 *
 * @param codes - Backup codes returned by enable or regenerate.
 */
export function BackupCodes({ codes }: BackupCodesProps) {
  const { localization } = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const { copied, copy } = useCopyToClipboard({
    onError: () => toast.danger(twoFactorLocalization.backupCodesCopyFailed)
  })
  const getBackupCodesText = () =>
    formatBackupCodesText(codes, twoFactorLocalization, window.location.origin)

  const copyCodes = () => copy(getBackupCodesText())

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-sm">
        {twoFactorLocalization.backupCodesDescription}
      </p>

      <ul className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-secondary p-4 font-mono text-sm">
        {codes.map((backupCode) => (
          <li className="tracking-wide" key={backupCode}>
            {backupCode}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button
          aria-label={
            copied
              ? twoFactorLocalization.backupCodesCopied
              : localization.settings.copyToClipboard
          }
          size="sm"
          variant="tertiary"
          onPress={copyCodes}
        >
          {copied ? <Check /> : <Copy />}
          {localization.settings.copyToClipboard}
        </Button>

        <Button
          size="sm"
          variant="tertiary"
          onPress={() =>
            downloadTextFile(getBackupCodesText(), "backup-codes.txt")
          }
        >
          <ArrowDownToLine />
          {twoFactorLocalization.downloadBackupCodes}
        </Button>

        <Button
          size="sm"
          variant="tertiary"
          onPress={() => printTextFile(getBackupCodesText())}
        >
          <Printer />
          {twoFactorLocalization.printBackupCodes}
        </Button>
      </div>
    </div>
  )
}
