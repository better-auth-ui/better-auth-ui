import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { PhoneNumberAuthClient } from "../../lib/auth-client"

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
  const mutationKey = phoneNumberMutationKeys.sendOtp
  const mutationFn = (params: SendPhoneNumberOtpParams<TAuthClient>) =>
    authClient.phoneNumber.sendOtp({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({ mutationKey, mutationFn })
}

/** Create a mutation for sending a phone verification code. */
export function useSendPhoneNumberOtp<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient, options?: SendPhoneNumberOtpOptions<TAuthClient>) {
  return useMutation({
    ...sendPhoneNumberOtpOptions(authClient),
    ...options
  })
}
