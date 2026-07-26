import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import type { TwoFactorAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SendTwoFactorOtpParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["sendOtp"]>[0]

/**
 * Mutation options factory for emailing the second-factor code.
 *
 * Authenticated by the two-factor cookie Better Auth set during sign-in, so
 * it only works while a challenge is pending.
 */
export function sendTwoFactorOtpOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.twoFactor.sendOtp,
    twoFactorMutationKeys.sendOtp
  )
}
