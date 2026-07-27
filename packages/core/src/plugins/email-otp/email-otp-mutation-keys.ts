/**
 * Mutation keys contributed by the email-OTP plugin.
 *
 * `signIn` stays under the shared `["auth", "signIn", ...]` namespace as the
 * built-in sign-in keys so consumers can match the whole sign-in surface with
 * `useIsMutating({ mutationKey: ["auth", "signIn"] })` regardless of which
 * strategy is in flight.
 *
 * @example
 * ```ts
 * useIsMutating({ mutationKey: emailOtpMutationKeys.signIn })
 * ```
 */
export const emailOtpMutationKeys = {
  /** Key for `signIn.emailOtp`. */
  signIn: ["auth", "signIn", "emailOtp"] as const,
  /** Key for `emailOtp.sendVerificationOtp`. */
  sendVerificationOtp: ["auth", "emailOtp", "sendVerificationOtp"] as const,
  /** Key for `emailOtp.verifyEmail`. */
  verifyEmail: ["auth", "emailOtp", "verifyEmail"] as const,
  /** Key for `emailOtp.requestPasswordReset`. */
  requestPasswordReset: ["auth", "emailOtp", "requestPasswordReset"] as const,
  /** Key for `emailOtp.resetPassword`. */
  resetPassword: ["auth", "emailOtp", "resetPassword"] as const,
  /** Key for `emailOtp.requestEmailChange`. */
  requestEmailChange: ["auth", "emailOtp", "requestEmailChange"] as const,
  /** Key for `emailOtp.changeEmail`. */
  changeEmail: ["auth", "emailOtp", "changeEmail"] as const
} as const
