import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { TwoFactorAuthClient } from "../../lib/auth-client"

export type DisableTwoFactorParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["disable"]>[0]

export type DisableTwoFactorOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof disableTwoFactorOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for disabling two-factor authentication.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 */
export function disableTwoFactorOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationKey = twoFactorMutationKeys.disable

  const mutationFn = (params: DisableTwoFactorParams<TAuthClient>) =>
    authClient.twoFactor.disable({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn
  })
}

/**
 * Create a mutation for disabling two-factor authentication.
 *
 * `MutationInvalidator` awaits invalidation of the session query so
 * `user.twoFactorEnabled` is refetched (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useDisableTwoFactor<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: DisableTwoFactorOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...disableTwoFactorOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
