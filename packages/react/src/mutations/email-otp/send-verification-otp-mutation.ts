import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { EmailOtpAuthClient } from "../../lib/auth-client"

export type SendVerificationOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["sendVerificationOtp"]>[0]

export type SendVerificationOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Omit<
    ReturnType<typeof sendVerificationOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/**
 * Mutation options factory for emailing a one-time code.
 *
 * The same endpoint backs every email-OTP flow — pass `type` to pick between
 * `"sign-in"`, `"email-verification"`, `"forget-password"`, and
 * `"change-email"`.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 */
export function sendVerificationOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  const mutationKey = emailOtpMutationKeys.sendVerificationOtp

  const mutationFn = (params: SendVerificationOtpParams<TAuthClient>) =>
    authClient.emailOtp.sendVerificationOtp({
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
 * Create a mutation for emailing a one-time code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSendVerificationOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: SendVerificationOtpOptions<TAuthClient>
) {
  return useMutation({
    ...sendVerificationOtpOptions(authClient),
    ...options
  })
}
