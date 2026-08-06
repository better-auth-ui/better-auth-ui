import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { EmailOtpAuthClient } from "./email-otp-auth-client"
import { emailOtpMutationKeys } from "./email-otp-mutation-keys"

export type ResetPasswordOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["resetPassword"]>[0]

export type ResetPasswordOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Omit<
    ReturnType<typeof resetPasswordOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/** Mutation options factory for resetting a password with an emailed code. */
export function resetPasswordOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  const mutationFn = (params: ResetPasswordOtpParams<TAuthClient>) =>
    authClient.emailOtp.resetPassword({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: emailOtpMutationKeys.resetPassword,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
