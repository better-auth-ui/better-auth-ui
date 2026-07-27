/**
 * Mutation keys contributed by the two-factor plugin.
 *
 * The three verification keys live under the shared
 * `["auth", "signIn", ...]` namespace because they are what actually creates
 * the session — sign-in isn't finished until the second factor succeeds, so
 * `useIsMutating({ mutationKey: ["auth", "signIn"] })` should still match.
 * Enrollment and management keys sit under `["auth", "twoFactor", ...]`.
 */
export const twoFactorMutationKeys = {
  /** Key for `twoFactor.enable`. */
  enable: ["auth", "twoFactor", "enable"] as const,
  /** Key for `twoFactor.disable`. */
  disable: ["auth", "twoFactor", "disable"] as const,
  /** Key for `twoFactor.getTotpUri`. */
  getTotpUri: ["auth", "twoFactor", "getTotpUri"] as const,
  /** Key for `twoFactor.generateBackupCodes`. */
  generateBackupCodes: ["auth", "twoFactor", "generateBackupCodes"] as const,
  /** Key for `twoFactor.sendOtp`. */
  sendOtp: ["auth", "twoFactor", "sendOtp"] as const,
  /** Key for `twoFactor.verifyTotp`. */
  verifyTotp: ["auth", "signIn", "twoFactor", "verifyTotp"] as const,
  /** Key for `twoFactor.verifyOtp`. */
  verifyOtp: ["auth", "signIn", "twoFactor", "verifyOtp"] as const,
  /** Key for `twoFactor.verifyBackupCode`. */
  verifyBackupCode: ["auth", "signIn", "twoFactor", "verifyBackupCode"] as const
} as const
