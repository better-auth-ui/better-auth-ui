import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import type { TwoFactorAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type VerifyTotpParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["verifyTotp"]>[0]

/**
 * Mutation options factory for verifying an authenticator code.
 *
 * Used both to finish a pending sign-in challenge and to confirm enrollment
 * right after enabling two-factor.
 */
export function verifyTotpOptions<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.twoFactor.verifyTotp,
    twoFactorMutationKeys.verifyTotp,
    { awaits: [authQueryKeys.session] }
  )
}
