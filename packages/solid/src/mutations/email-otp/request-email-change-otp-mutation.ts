import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import type { EmailOtpAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type RequestEmailChangeOtpParams<
  TAuthClient extends EmailOtpAuthClient
> = Parameters<TAuthClient["emailOtp"]["requestEmailChange"]>[0]

/**
 * Mutation options factory for starting an email change with a code.
 *
 * Sends a code to the new address. When the server runs with
 * `changeEmail: { verifyCurrentEmail: true }`, pass the `otp` the user
 * received at their current address as well.
 */
export function requestEmailChangeOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.emailOtp.requestEmailChange,
    emailOtpMutationKeys.requestEmailChange
  )
}
