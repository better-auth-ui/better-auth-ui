import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import type { TwoFactorAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type GenerateBackupCodesParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["generateBackupCodes"]>[0]

/**
 * Mutation options factory for regenerating backup codes.
 *
 * Resolves with the new codes — they are shown once and never returned
 * again, so keep them in component state rather than the query cache.
 */
export function generateBackupCodesOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.twoFactor.generateBackupCodes,
    twoFactorMutationKeys.generateBackupCodes
  )
}
