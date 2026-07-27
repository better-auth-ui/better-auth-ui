"use client"

import {
  downloadTextFile,
  formatBackupCodesText,
  printTextFile
} from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { Copy, Download, Printer } from "lucide-react"
import { toast } from "sonner"

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
 *
 * @param codes - Backup codes returned by enable or regenerate.
 */
export function BackupCodes({ codes }: BackupCodesProps) {
  const { localization } = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const getBackupCodesText = () =>
    formatBackupCodesText(codes, twoFactorLocalization, window.location.origin)

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
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        {twoFactorLocalization.backupCodesDescription}
      </p>

      <ul className="grid grid-cols-2 gap-2 rounded-md border bg-muted/40 p-4 font-mono text-sm">
        {codes.map((backupCode) => (
          <li className="tracking-wide" key={backupCode}>
            {backupCode}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={copyCodes}>
          <Copy data-icon="inline-start" />
          {localization.settings.copyToClipboard}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            downloadTextFile(getBackupCodesText(), "backup-codes.txt")
          }
        >
          <Download data-icon="inline-start" />
          {twoFactorLocalization.downloadBackupCodes}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => printTextFile(getBackupCodesText())}
        >
          <Printer data-icon="inline-start" />
          {twoFactorLocalization.printBackupCodes}
        </Button>
      </div>
    </div>
  )
}
