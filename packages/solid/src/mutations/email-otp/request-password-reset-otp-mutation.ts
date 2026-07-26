import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import type { EmailOtpAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type RequestPasswordResetOtpParams<
  TAuthClient extends EmailOtpAuthClient
> = Parameters<TAuthClient["emailOtp"]["requestPasswordReset"]>[0]

/** Mutation options factory for emailing a password-reset code. */
export function requestPasswordResetOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.emailOtp.requestPasswordReset,
    emailOtpMutationKeys.requestPasswordReset
  )
}
