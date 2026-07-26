import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import type { EmailOtpAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SendVerificationOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["sendVerificationOtp"]>[0]

/**
 * Mutation options factory for emailing a one-time code.
 *
 * The same endpoint backs every email-OTP flow — pass `type` to pick between
 * `"sign-in"`, `"email-verification"`, `"forget-password"`, and
 * `"change-email"`.
 */
export function sendVerificationOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.emailOtp.sendVerificationOtp,
    emailOtpMutationKeys.sendVerificationOtp
  )
}
