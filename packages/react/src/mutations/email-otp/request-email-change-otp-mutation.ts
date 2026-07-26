import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { EmailOtpAuthClient } from "../../lib/auth-client"

export type RequestEmailChangeOtpParams<
  TAuthClient extends EmailOtpAuthClient
> = Parameters<TAuthClient["emailOtp"]["requestEmailChange"]>[0]

export type RequestEmailChangeOtpOptions<
  TAuthClient extends EmailOtpAuthClient
> = Omit<
  ReturnType<typeof requestEmailChangeOtpOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for starting an email change with a code.
 *
 * Sends a code to the new address. When the server runs with
 * `changeEmail: { verifyCurrentEmail: true }`, pass the `otp` the user
 * received at their current address as well.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 */
export function requestEmailChangeOtpOptions<
  TAuthClient extends EmailOtpAuthClient
>(authClient: TAuthClient) {
  const mutationKey = emailOtpMutationKeys.requestEmailChange

  const mutationFn = (params: RequestEmailChangeOtpParams<TAuthClient>) =>
    authClient.emailOtp.requestEmailChange({
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
 * Create a mutation for starting an email change with a code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useRequestEmailChangeOtp<
  TAuthClient extends EmailOtpAuthClient
>(
  authClient: TAuthClient,
  options?: RequestEmailChangeOtpOptions<TAuthClient>
) {
  return useMutation({
    ...requestEmailChangeOtpOptions(authClient),
    ...options
  })
}
