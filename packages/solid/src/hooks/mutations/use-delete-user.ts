import {
  type AuthClient,
  type DeleteUserOptions,
  deleteUserOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseDeleteUserOptions<TAuthClient extends AuthClient> = Accessor<
  DeleteUserOptions<TAuthClient>
>

/**
 * Create a mutation for deleting the current user.
 *
 * @param authClient - The Better Auth client.
 * @param options - Solid Query options forwarded to `useMutation`.
 * @param queryClient - Optional Solid Query client accessor to scope this mutation to.
 */
export function useDeleteUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseDeleteUserOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...deleteUserOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
