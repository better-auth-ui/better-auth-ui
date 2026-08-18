/**
 * Mutation keys contributed by the passkey plugin.
 *
 * `signIn` is kept under the shared `["auth", "signIn", ...]` namespace so
 * consumers can match the whole sign-in surface with
 * `useIsMutating({ mutationKey: ["auth", "signIn"] })`.
 */
export const passkeyMutationKeys = {
  /** Key for `signIn.passkey`. */
  signIn: ["auth", "signIn", "passkey"] as const,
  /** Key for `passkey.addPasskey`. */
  addPasskey: ["auth", "passkey", "addPasskey"] as const,
  /** Key for `passkey.deletePasskey`. */
  deletePasskey: ["auth", "passkey", "deletePasskey"] as const,
  /** Key for `passkey.updatePasskey`. */
  updatePasskey: ["auth", "passkey", "updatePasskey"] as const
} as const
