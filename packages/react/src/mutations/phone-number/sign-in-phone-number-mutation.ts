import { authQueryKeys } from "@better-auth-ui/core"
import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { PhoneNumberAuthClient } from "../../lib/auth-client"

export type SignInPhoneNumberParams<TAuthClient extends PhoneNumberAuthClient> =
  Parameters<TAuthClient["signIn"]["phoneNumber"]>[0]

export type SignInPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof signInPhoneNumberOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for phone-number and password sign-in. */
export function signInPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationKey = phoneNumberMutationKeys.signIn
  const mutationFn = (params: SignInPhoneNumberParams<TAuthClient>) =>
    authClient.signIn.phoneNumber({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({ mutationKey, mutationFn })
}

/** Create a mutation for phone-number and password sign-in. */
export function useSignInPhoneNumber<TAuthClient extends PhoneNumberAuthClient>(
  authClient: TAuthClient,
  options?: SignInPhoneNumberOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInPhoneNumberOptions(authClient),
      ...options,
      meta: { awaits: [authQueryKeys.session] }
    },
    queryClient
  )
}
