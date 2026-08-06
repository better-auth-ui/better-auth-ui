import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { EmailOtpAuthClient } from "./email-otp-auth-client"
import { emailOtpMutationKeys } from "./email-otp-mutation-keys"

export type SendVerificationOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["sendVerificationOtp"]>[0]

export type SendVerificationOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Omit<
    ReturnType<typeof sendVerificationOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/** Mutation options factory for emailing a one-time code. */
export function sendVerificationOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: SendVerificationOtpParams<TAuthClient>) =>
    authClient.emailOtp.sendVerificationOtp({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: emailOtpMutationKeys.sendVerificationOtp,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
