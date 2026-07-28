/**
 * Mutation keys contributed by the phone-number plugin.
 *
 * Both sign-in strategies share the built-in sign-in namespace so callers can
 * observe every active sign-in request with `["auth", "signIn"]`.
 */
export const phoneNumberMutationKeys = {
  /** Key for password-based `signIn.phoneNumber`. */
  signIn: ["auth", "signIn", "phoneNumber"] as const,
  /** Key for `phoneNumber.sendOtp`. */
  sendOtp: ["auth", "phoneNumber", "sendOtp"] as const,
  /** Key for `phoneNumber.verify`. */
  verify: ["auth", "phoneNumber", "verify"] as const,
  /** Key for `phoneNumber.requestPasswordReset`. */
  requestPasswordReset: [
    "auth",
    "phoneNumber",
    "requestPasswordReset"
  ] as const,
  /** Key for `phoneNumber.resetPassword`. */
  resetPassword: ["auth", "phoneNumber", "resetPassword"] as const
} as const
