import { authQueryKeys } from "@better-auth-ui/core"
import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { PhoneNumberAuthClient } from "../../lib/auth-client"

export type VerifyPhoneNumberParams<TAuthClient extends PhoneNumberAuthClient> =
  Parameters<TAuthClient["phoneNumber"]["verify"]>[0]

export type VerifyPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof verifyPhoneNumberOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for verifying a phone-number code. */
export function verifyPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationKey = phoneNumberMutationKeys.verify
  const mutationFn = (params: VerifyPhoneNumberParams<TAuthClient>) =>
    authClient.phoneNumber.verify({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({ mutationKey, mutationFn })
}

/**
 * Create a mutation for verifying a phone-number code.
 *
 * Verification can create a session or update the current user's phone
 * number, so the session query is refreshed before success settles.
 */
export function useVerifyPhoneNumber<TAuthClient extends PhoneNumberAuthClient>(
  authClient: TAuthClient,
  options?: VerifyPhoneNumberOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...verifyPhoneNumberOptions(authClient),
      ...options,
      meta: { awaits: [authQueryKeys.session] }
    },
    queryClient
  )
}
