import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import type { EmailOtpAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type ResetPasswordOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["resetPassword"]>[0]

/** Mutation options factory for resetting a password with an emailed code. */
export function resetPasswordOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.emailOtp.resetPassword,
    emailOtpMutationKeys.resetPassword
  )
}
