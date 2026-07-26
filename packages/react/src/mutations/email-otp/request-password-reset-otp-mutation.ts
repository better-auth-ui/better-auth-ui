import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { EmailOtpAuthClient } from "../../lib/auth-client"

export type RequestPasswordResetOtpParams<
  TAuthClient extends EmailOtpAuthClient
> = Parameters<TAuthClient["emailOtp"]["requestPasswordReset"]>[0]

export type RequestPasswordResetOtpOptions<
  TAuthClient extends EmailOtpAuthClient
> = Omit<
  ReturnType<typeof requestPasswordResetOtpOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for emailing a password-reset code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 */
export function requestPasswordResetOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  const mutationKey = emailOtpMutationKeys.requestPasswordReset

  const mutationFn = (params: RequestPasswordResetOtpParams<TAuthClient>) =>
    authClient.emailOtp.requestPasswordReset({
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
 * Create a mutation for emailing a password-reset code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useRequestPasswordResetOtp<
  TAuthClient extends EmailOtpAuthClient
>(
  authClient: TAuthClient,
  options?: RequestPasswordResetOtpOptions<TAuthClient>
) {
  return useMutation({
    ...requestPasswordResetOtpOptions(authClient),
    ...options
  })
}
