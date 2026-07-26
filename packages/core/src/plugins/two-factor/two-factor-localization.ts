export const twoFactorLocalization = {
  /** @remarks `"Two-Factor Authentication"` */
  twoFactor: "Two-Factor Authentication",
  /** @remarks `"Add a second step to sign-in so a stolen password isn't enough"` */
  twoFactorDescription:
    "Add a second step to sign-in so a stolen password isn't enough",
  /** @remarks `"Enable two-factor"` */
  enableTwoFactor: "Enable two-factor",
  /** @remarks `"Disable two-factor"` */
  disableTwoFactor: "Disable two-factor",
  /** @remarks `"Two-factor authentication is on"` */
  twoFactorEnabled: "Two-factor authentication is on",
  /** @remarks `"Two-factor authentication is off"` */
  twoFactorDisabled: "Two-factor authentication is off",
  /** @remarks `"Enter your password to continue"` */
  passwordConfirmation: "Enter your password to continue",
  /** @remarks `"Scan this with your authenticator app"` */
  scanQrCode: "Scan this with your authenticator app",
  /** @remarks `"Can't scan? Enter this setup key instead"` */
  setupKey: "Can't scan? Enter this setup key instead",
  /** @remarks `"Authenticator code"` */
  authenticatorCode: "Authenticator code",
  /** @remarks `"Enter the code from your authenticator app"` */
  authenticatorCodeDescription: "Enter the code from your authenticator app",
  /** @remarks `"Emailed code"` */
  emailedCode: "Emailed code",
  /** @remarks `"We emailed you a code. Enter it to finish signing in"` */
  emailedCodeDescription:
    "We emailed you a code. Enter it to finish signing in",
  /** @remarks `"Email me a code"` */
  sendEmailCode: "Email me a code",
  /** @remarks `"Backup code"` */
  backupCode: "Backup code",
  /** @remarks `"Enter one of the backup codes you saved"` */
  backupCodeDescription: "Enter one of the backup codes you saved",
  /** @remarks `"Backup codes"` */
  backupCodes: "Backup codes",
  /** @remarks `"Save these somewhere safe. Each code works once if you lose your authenticator."` */
  backupCodesDescription:
    "Save these somewhere safe. Each code works once if you lose your authenticator.",
  /** @remarks `"Backup codes copied"` */
  backupCodesCopied: "Backup codes copied",
  /** @remarks `"Couldn't copy the backup codes. Select and copy them manually."` */
  backupCodesCopyFailed:
    "Couldn't copy the backup codes. Select and copy them manually.",
  /** @remarks `"Regenerate backup codes"` */
  regenerateBackupCodes: "Regenerate backup codes",
  /** @remarks `"New backup codes generated. The old ones no longer work."` */
  backupCodesRegenerated:
    "New backup codes generated. The old ones no longer work.",
  /** @remarks `"Use your authenticator app"` */
  useAuthenticator: "Use your authenticator app",
  /** @remarks `"Use an emailed code"` */
  useEmailedCode: "Use an emailed code",
  /** @remarks `"Use a backup code"` */
  useBackupCode: "Use a backup code",
  /** @remarks `"Trust this device"` */
  trustDevice: "Trust this device",
  /** @remarks `"Skip the second step on this device from now on"` */
  trustDeviceDescription: "Skip the second step on this device from now on",
  /** @remarks `"Verify"` */
  verify: "Verify",
  /** @remarks `"Enter the {{length}}-digit code"` */
  codeLengthMismatch: "Enter the {{length}}-digit code",
  /** @remarks `"Back to sign in"` */
  backToSignIn: "Back to sign in",
  /** @remarks `"Done"` */
  done: "Done"
}

export type TwoFactorLocalization = typeof twoFactorLocalization
