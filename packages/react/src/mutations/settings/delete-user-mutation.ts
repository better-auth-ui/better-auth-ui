import { deleteUserMutationKeys } from "@better-auth-ui/core/plugins/delete-user"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { AuthClient } from "../../lib/auth-client"

export type DeleteUserParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["deleteUser"]
>[0]

export type DeleteUserOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof deleteUserOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for deleting the authenticated user's account.
 *
 * @param authClient - The Better Auth client.
 */
export function deleteUserOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = deleteUserMutationKeys.deleteUser

  const mutationFn = (params: DeleteUserParams<TAuthClient>) =>
    authClient.deleteUser({
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
 * Create a mutation for deleting the authenticated user's account.
 *
 * Wraps `authClient.deleteUser` and forwards React Query mutation options
 * such as `onSuccess`, `onError`, and `retry`.
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useDeleteUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: DeleteUserOptions<TAuthClient>
) {
  return useMutation({
    ...deleteUserOptions(authClient),
    ...options
  })
}
