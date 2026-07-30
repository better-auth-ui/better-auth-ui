/** Mutation keys contributed by the phone verification plugin. */
export const phoneVerificationMutationKeys = {
  /** Key for `createVerification`. */
  createVerification: [
    "auth",
    "phoneVerification",
    "createVerification"
  ] as const,
  /** Key for `cancelVerification`. */
  cancelVerification: [
    "auth",
    "phoneVerification",
    "cancelVerification"
  ] as const
} as const
