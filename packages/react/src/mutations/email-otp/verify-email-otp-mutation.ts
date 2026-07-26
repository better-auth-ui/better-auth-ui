import { authQueryKeys } from "@better-auth-ui/core"
import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { EmailOtpAuthClient } from "../../lib/auth-client"

export type VerifyEmailOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["verifyEmail"]>[0]

export type VerifyEmailOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Omit<
    ReturnType<typeof verifyEmailOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for verifying an email address with a code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 */
export function verifyEmailOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = emailOtpMutationKeys.verifyEmail

  const mutationFn = (params: VerifyEmailOtpParams<TAuthClient>) =>
    authClient.emailOtp.verifyEmail({
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
 * Create a mutation for verifying an email address with a code.
 *
 * Verification signs the user in, so `MutationInvalidator` awaits
 * invalidation of the session query (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useVerifyEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: VerifyEmailOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...verifyEmailOtpOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
