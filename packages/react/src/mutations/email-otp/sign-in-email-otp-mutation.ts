import { authQueryKeys } from "@better-auth-ui/core"
import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { EmailOtpAuthClient } from "../../lib/auth-client"

export type SignInEmailOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["signIn"]["emailOtp"]>[0]

export type SignInEmailOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Omit<
    ReturnType<typeof signInEmailOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for passwordless sign-in with an emailed code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 */
export function signInEmailOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = emailOtpMutationKeys.signIn

  const mutationFn = (params: SignInEmailOtpParams<TAuthClient>) =>
    authClient.signIn.emailOtp({
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
 * Create a mutation for passwordless sign-in with an emailed code.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session query
 * so the new session is refetched (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: SignInEmailOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInEmailOtpOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
