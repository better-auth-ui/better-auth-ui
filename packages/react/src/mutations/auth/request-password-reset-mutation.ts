import { authMutationKeys } from "@better-auth-ui/core"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

import type { AuthClient } from "../../lib/auth-client"

export type RequestPasswordResetParams<TAuthClient extends AuthClient> =
  Parameters<TAuthClient["requestPasswordReset"]>[0]

export type RequestPasswordResetOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof requestPasswordResetOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for requesting a password reset email.
 *
 * @param authClient - The Better Auth client.
 */
export function requestPasswordResetOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.requestPasswordReset

  const mutationFn = (params: RequestPasswordResetParams<TAuthClient>) =>
    authClient.requestPasswordReset({
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
 * Create a mutation for requesting a password reset email.
 *
 * Wraps `authClient.requestPasswordReset` and forwards React Query mutation
 * options such as `onSuccess`, `onError`, and `retry`.
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useRequestPasswordReset<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: RequestPasswordResetOptions<TAuthClient>
) {
  return useMutation({
    ...requestPasswordResetOptions(authClient),
    ...options
  })
}
