import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { TwoFactorAuthClient } from "../../lib/auth-client"

export type VerifyBackupCodeParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["verifyBackupCode"]>[0]

export type VerifyBackupCodeOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof verifyBackupCodeOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for recovering with a backup code.
 *
 * Each code works once — the server consumes it on success.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 */
export function verifyBackupCodeOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationKey = twoFactorMutationKeys.verifyBackupCode

  const mutationFn = (params: VerifyBackupCodeParams<TAuthClient>) =>
    authClient.twoFactor.verifyBackupCode({
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
 * Create a mutation for recovering with a backup code.
 *
 * Recovery is what creates the session, so `MutationInvalidator` awaits
 * invalidation of the session query (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useVerifyBackupCode<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: VerifyBackupCodeOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...verifyBackupCodeOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
