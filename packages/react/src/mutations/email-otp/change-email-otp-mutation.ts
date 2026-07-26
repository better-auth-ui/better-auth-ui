import { authQueryKeys } from "@better-auth-ui/core"
import { emailOtpMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { EmailOtpAuthClient } from "../../lib/auth-client"

export type ChangeEmailOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["changeEmail"]>[0]

export type ChangeEmailOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Omit<
    ReturnType<typeof changeEmailOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for confirming an email change with a code.
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 */
export function changeEmailOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = emailOtpMutationKeys.changeEmail

  const mutationFn = (params: ChangeEmailOtpParams<TAuthClient>) =>
    authClient.emailOtp.changeEmail({
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
 * Create a mutation for confirming an email change with a code.
 *
 * The address on the session changes, so `MutationInvalidator` awaits
 * invalidation of the session query (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the email-OTP plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useChangeEmailOtp<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient,
  options?: ChangeEmailOtpOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...changeEmailOtpOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
