import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { EmailOtpAuthClient } from "./email-otp-auth-client"
import { emailOtpMutationKeys } from "./email-otp-mutation-keys"

export type RequestPasswordResetOtpParams<
  TAuthClient extends EmailOtpAuthClient
> = Parameters<TAuthClient["emailOtp"]["requestPasswordReset"]>[0]

export type RequestPasswordResetOtpOptions<
  TAuthClient extends EmailOtpAuthClient
> = Omit<
  ReturnType<typeof requestPasswordResetOtpOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for emailing a password-reset code. */
export function requestPasswordResetOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: RequestPasswordResetOtpParams<TAuthClient>) =>
    authClient.emailOtp.requestPasswordReset({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: emailOtpMutationKeys.requestPasswordReset,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
