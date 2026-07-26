import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import type { TwoFactorAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type GetTotpUriParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["getTotpUri"]>[0]

/**
 * Mutation options factory for re-reading the TOTP URI of an enrolled user.
 *
 * Modelled as a mutation rather than a query: the endpoint is a POST that
 * takes the user's password and returns a secret that shouldn't be cached.
 */
export function getTotpUriOptions<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.twoFactor.getTotpUri,
    twoFactorMutationKeys.getTotpUri
  )
}
