import { twoFactorMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { TwoFactorAuthClient } from "../../lib/auth-client"

export type SendTwoFactorOtpParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["sendOtp"]>[0]

export type SendTwoFactorOtpOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof sendTwoFactorOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/**
 * Mutation options factory for emailing the second-factor code.
 *
 * Authenticated by the two-factor cookie Better Auth set during sign-in, so
 * it only works while a challenge is pending.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 */
export function sendTwoFactorOtpOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationKey = twoFactorMutationKeys.sendOtp

  const mutationFn = (
    // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
    params?: SendTwoFactorOtpParams<TAuthClient> | void
  ) =>
    authClient.twoFactor.sendOtp({
      ...(params ?? {}),
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
 * Create a mutation for emailing the second-factor code.
 *
 * @param authClient - The Better Auth client with the two-factor plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSendTwoFactorOtp<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient,
  options?: SendTwoFactorOtpOptions<TAuthClient>
) {
  return useMutation({
    ...sendTwoFactorOtpOptions(authClient),
    ...options
  })
}
