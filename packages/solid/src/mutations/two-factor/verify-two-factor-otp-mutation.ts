import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import type { TwoFactorAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type VerifyTwoFactorOtpParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["verifyOtp"]>[0]

/** Mutation options factory for verifying the emailed second-factor code. */
export function verifyTwoFactorOtpOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.twoFactor.verifyOtp,
    twoFactorMutationKeys.verifyOtp,
    { awaits: [authQueryKeys.session] }
  )
}
