import { authQueryKeys } from "@better-auth-ui/core"
import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { TwoFactorAuthClient } from "../../lib/auth-client"

export type VerifyTwoFactorOtpParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["verifyOtp"]>[0]

export type VerifyTwoFactorOtpOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof verifyTwoFactorOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for verifying the emailed second-factor code.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 */
export function verifyTwoFactorOtpOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationKey = twoFactorMutationKeys.verifyOtp

  const mutationFn = (params: VerifyTwoFactorOtpParams<TAuthClient>) =>
    authClient.twoFactor.verifyOtp({
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
 * Create a mutation for verifying the emailed second-factor code.
 *
 * Verification is what creates the session, so `MutationInvalidator` awaits
 * invalidation of the session query (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useVerifyTwoFactorOtp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: VerifyTwoFactorOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...verifyTwoFactorOtpOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
