import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { TwoFactorAuthClient } from "../../lib/auth-client"

export type GetTotpUriParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["getTotpUri"]>[0]

export type GetTotpUriOptions<TAuthClient extends TwoFactorAuthClient> = Omit<
  ReturnType<typeof getTotpUriOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for re-reading the TOTP URI of an enrolled user.
 *
 * Modelled as a mutation rather than a query: the endpoint is a POST that
 * takes the user's password and returns a secret that shouldn't be cached.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 */
export function getTotpUriOptions<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = twoFactorMutationKeys.getTotpUri

  const mutationFn = (params: GetTotpUriParams<TAuthClient>) =>
    authClient.twoFactor.getTotpUri({
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
 * Create a mutation for re-reading the TOTP URI of an enrolled user.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useGetTotpUri<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: GetTotpUriOptions<TAuthClient>
) {
  return useMutation({
    ...getTotpUriOptions(authClient),
    ...options
  })
}
