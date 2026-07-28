import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { PhoneNumberAuthClient } from "../../lib/auth-client"

export type ResetPhoneNumberPasswordParams<
  TAuthClient extends PhoneNumberAuthClient
> = Parameters<TAuthClient["phoneNumber"]["resetPassword"]>[0]

export type ResetPhoneNumberPasswordOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof resetPhoneNumberPasswordOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for resetting a password with a phone code. */
export function resetPhoneNumberPasswordOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationKey = phoneNumberMutationKeys.resetPassword
  const mutationFn = (params: ResetPhoneNumberPasswordParams<TAuthClient>) =>
    authClient.phoneNumber.resetPassword({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({ mutationKey, mutationFn })
}

/** Create a mutation for resetting a password with a phone code. */
export function useResetPhoneNumberPassword<
  TAuthClient extends PhoneNumberAuthClient
>(
  authClient: TAuthClient,
  options?: ResetPhoneNumberPasswordOptions<TAuthClient>
) {
  return useMutation({
    ...resetPhoneNumberPasswordOptions(authClient),
    ...options
  })
}
