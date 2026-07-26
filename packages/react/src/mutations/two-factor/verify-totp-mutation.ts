import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { TwoFactorAuthClient } from "../../lib/auth-client"

export type VerifyTotpParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["verifyTotp"]>[0]

export type VerifyTotpOptions<TAuthClient extends TwoFactorAuthClient> = Omit<
  ReturnType<typeof verifyTotpOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for verifying an authenticator code.
 *
 * Used both to finish a pending sign-in challenge and to confirm enrollment
 * right after enabling two-factor.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 */
export function verifyTotpOptions<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = twoFactorMutationKeys.verifyTotp

  const mutationFn = (params: VerifyTotpParams<TAuthClient>) =>
    authClient.twoFactor.verifyTotp({
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
 * Create a mutation for verifying an authenticator code.
 *
 * Verification is what creates the session, so `MutationInvalidator` awaits
 * invalidation of the session query (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useVerifyTotp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: VerifyTotpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...verifyTotpOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
