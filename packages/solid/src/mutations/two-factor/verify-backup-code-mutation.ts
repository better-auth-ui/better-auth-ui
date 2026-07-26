import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import type { TwoFactorAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type VerifyBackupCodeParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["verifyBackupCode"]>[0]

/**
 * Mutation options factory for recovering with a backup code.
 *
 * Each code works once — the server consumes it on success.
 */
export function verifyBackupCodeOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.twoFactor.verifyBackupCode,
    twoFactorMutationKeys.verifyBackupCode,
    { awaits: [authQueryKeys.session] }
  )
}
