import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import type { TwoFactorAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type DisableTwoFactorParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["disable"]>[0]

/** Mutation options factory for disabling two-factor authentication. */
export function disableTwoFactorOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.twoFactor.disable,
    twoFactorMutationKeys.disable,
    { awaits: [authQueryKeys.session] }
  )
}
