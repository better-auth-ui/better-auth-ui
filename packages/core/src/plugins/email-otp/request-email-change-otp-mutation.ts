import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { EmailOtpAuthClient } from "./email-otp-auth-client"
import { emailOtpMutationKeys } from "./email-otp-mutation-keys"

export type RequestEmailChangeOtpParams<
  TAuthClient extends EmailOtpAuthClient
> = Parameters<TAuthClient["emailOtp"]["requestEmailChange"]>[0]

export type RequestEmailChangeOtpOptions<
  TAuthClient extends EmailOtpAuthClient
> = Omit<
  ReturnType<typeof requestEmailChangeOtpOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for starting an email change with a code. */
export function requestEmailChangeOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: RequestEmailChangeOtpParams<TAuthClient>) =>
    authClient.emailOtp.requestEmailChange({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: emailOtpMutationKeys.requestEmailChange,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
