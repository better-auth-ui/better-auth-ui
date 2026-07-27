export type BackupCodesTextLocalization = {
  backupCodesDescription: string
  backupCodesForWebsite: string
}

/**
 * Format backup codes for copying, downloading, or printing.
 *
 * @param codes - Backup codes to include.
 * @param twoFactorLocalization - Localized heading and description.
 * @param origin - Website origin the backup codes belong to.
 */
export function formatBackupCodesText(
  codes: readonly string[],
  twoFactorLocalization: BackupCodesTextLocalization,
  origin: string
) {
  return [
    twoFactorLocalization.backupCodesForWebsite.replace("{{website}}", origin),
    twoFactorLocalization.backupCodesDescription,
    "",
    ...codes
  ].join("\n")
}
