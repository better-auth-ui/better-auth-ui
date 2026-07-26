import { authQueryKeys } from "@better-auth-ui/core"
import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import type { EmailOtpAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInEmailOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["signIn"]["emailOtp"]>[0]

/** Mutation options factory for passwordless sign-in with an emailed code. */
export function signInEmailOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.emailOtp,
    emailOtpMutationKeys.signIn,
    { awaits: [authQueryKeys.session] }
  )
}
