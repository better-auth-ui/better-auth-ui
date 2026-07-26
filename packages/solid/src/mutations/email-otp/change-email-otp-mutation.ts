import { authQueryKeys } from "@better-auth-ui/core"
import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import type { EmailOtpAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type ChangeEmailOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["changeEmail"]>[0]

/** Mutation options factory for confirming an email change with a code. */
export function changeEmailOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.emailOtp.changeEmail,
    emailOtpMutationKeys.changeEmail,
    { awaits: [authQueryKeys.session] }
  )
}
