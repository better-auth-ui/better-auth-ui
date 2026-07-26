import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { EmailOtpAuthClient } from "../../lib/auth-client"

export type ResetPasswordOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["resetPassword"]>[0]

export type ResetPasswordOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Omit<
    ReturnType<typeof resetPasswordOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/**
 * Mutation options factory for resetting a password with an emailed code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 */
export function resetPasswordOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = emailOtpMutationKeys.resetPassword

  const mutationFn = (params: ResetPasswordOtpParams<TAuthClient>) =>
    authClient.emailOtp.resetPassword({
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
 * Create a mutation for resetting a password with an emailed code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useResetPasswordOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: ResetPasswordOtpOptions<TAuthClient>
) {
  return useMutation({
    ...resetPasswordOtpOptions(authClient),
    ...options
  })
}
