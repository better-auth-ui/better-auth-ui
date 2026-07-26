import { authQueryKeys } from "@better-auth-ui/core"
import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import type { EmailOtpAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type VerifyEmailOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["verifyEmail"]>[0]

/** Mutation options factory for verifying an email address with a code. */
export function verifyEmailOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.emailOtp.verifyEmail,
    emailOtpMutationKeys.verifyEmail,
    { awaits: [authQueryKeys.session] }
  )
}
