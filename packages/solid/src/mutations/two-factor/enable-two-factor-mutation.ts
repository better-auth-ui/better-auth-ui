import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import type { TwoFactorAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type EnableTwoFactorParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["enable"]>[0]

/**
 * Mutation options factory for enabling two-factor authentication.
 *
 * Resolves with the TOTP URI and the generated backup codes. Unless the
 * server sets `skipVerificationOnEnable`, two-factor only becomes active once
 * the user verifies a TOTP code.
 */
export function enableTwoFactorOptions<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient
) {
  // The response carries a secret (TOTP URI and/or backup codes). Dropping it
  // from the mutation cache immediately keeps it out of devtools and
  // `MutationCache` lookups once the flow is done.
  return createAuthMutationOptions(
    authClient.twoFactor.enable,
    twoFactorMutationKeys.enable,
    { awaits: [authQueryKeys.session] },
    0
  )
}
