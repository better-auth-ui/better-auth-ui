import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { TwoFactorAuthClient } from "../../lib/auth-client"

export type GenerateBackupCodesParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["generateBackupCodes"]>[0]

export type GenerateBackupCodesOptions<
  TAuthClient extends TwoFactorAuthClient
> = Omit<
  ReturnType<typeof generateBackupCodesOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for regenerating backup codes.
 *
 * Resolves with the new codes — they are shown once and never returned
 * again, so keep them in component state rather than the query cache.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 */
export function generateBackupCodesOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationKey = twoFactorMutationKeys.generateBackupCodes

  const mutationFn = (params: GenerateBackupCodesParams<TAuthClient>) =>
    authClient.twoFactor.generateBackupCodes({
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
 * Create a mutation for regenerating backup codes.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useGenerateBackupCodes<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: GenerateBackupCodesOptions<TAuthClient>
) {
  return useMutation({
    ...generateBackupCodesOptions(authClient),
    ...options
  })
}
