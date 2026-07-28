import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { PhoneNumberAuthClient } from "./phone-number-auth-client"
import { phoneNumberMutationKeys } from "./phone-number-mutation-keys"

export type SendPhoneNumberOtpParams<
  TAuthClient extends PhoneNumberAuthClient
> = Parameters<TAuthClient["phoneNumber"]["sendOtp"]>[0]

export type SendPhoneNumberOtpOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof sendPhoneNumberOtpOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for sending a phone verification code. */
export function sendPhoneNumberOtpOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: SendPhoneNumberOtpParams<TAuthClient>) =>
    authClient.phoneNumber.sendOtp({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: phoneNumberMutationKeys.sendOtp,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
