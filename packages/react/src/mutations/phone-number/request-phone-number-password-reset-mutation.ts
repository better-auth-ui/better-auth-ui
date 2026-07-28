import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { PhoneNumberAuthClient } from "../../lib/auth-client"

export type RequestPhoneNumberPasswordResetParams<
  TAuthClient extends PhoneNumberAuthClient
> = Parameters<TAuthClient["phoneNumber"]["requestPasswordReset"]>[0]

export type RequestPhoneNumberPasswordResetOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof requestPhoneNumberPasswordResetOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for sending a phone password-reset code. */
export function requestPhoneNumberPasswordResetOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationKey = phoneNumberMutationKeys.requestPasswordReset
  const mutationFn = (
    params: RequestPhoneNumberPasswordResetParams<TAuthClient>
  ) =>
    authClient.phoneNumber.requestPasswordReset({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({ mutationKey, mutationFn })
}

/** Create a mutation for sending a phone password-reset code. */
export function useRequestPhoneNumberPasswordReset<
  TAuthClient extends PhoneNumberAuthClient
>(
  authClient: TAuthClient,
  options?: RequestPhoneNumberPasswordResetOptions<TAuthClient>
) {
  return useMutation({
    ...requestPhoneNumberPasswordResetOptions(authClient),
    ...options
  })
}
