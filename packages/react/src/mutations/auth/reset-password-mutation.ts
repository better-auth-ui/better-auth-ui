import { authMutationKeys } from "@better-auth-ui/core"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

import type { AuthClient } from "../../lib/auth-client"

export type ResetPasswordParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["resetPassword"]
>[0]

export type ResetPasswordOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof resetPasswordOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for completing a password reset.
 *
 * @param authClient - The Better Auth client.
 */
export function resetPasswordOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.resetPassword

  const mutationFn = (params: ResetPasswordParams<TAuthClient>) =>
    authClient.resetPassword({
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
 * Create a mutation for completing a password reset.
 *
 * Wraps `authClient.resetPassword` (using the token from the reset email)
 * and forwards React Query mutation options such as `onSuccess`, `onError`,
 * and `retry`.
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useResetPassword<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: ResetPasswordOptions<TAuthClient>
) {
  return useMutation({
    ...resetPasswordOptions(authClient),
    ...options
  })
}
