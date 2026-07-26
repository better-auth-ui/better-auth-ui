import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { TwoFactorAuthClient } from "../../lib/auth-client"

export type EnableTwoFactorParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["enable"]>[0]

export type EnableTwoFactorOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof enableTwoFactorOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for enabling two-factor authentication.
 *
 * Resolves with the TOTP URI and the generated backup codes. Unless the
 * server sets `skipVerificationOnEnable`, two-factor only becomes active once
 * the user verifies a TOTP code.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 */
export function enableTwoFactorOptions<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = twoFactorMutationKeys.enable

  const mutationFn = (params: EnableTwoFactorParams<TAuthClient>) =>
    authClient.twoFactor.enable({
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
 * Create a mutation for enabling two-factor authentication.
 *
 * `MutationInvalidator` awaits invalidation of the session query so
 * `user.twoFactorEnabled` is refetched (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useEnableTwoFactor<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: EnableTwoFactorOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...enableTwoFactorOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
