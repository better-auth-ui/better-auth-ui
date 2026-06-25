import {
  type AuthClient,
  type DeleteUserOptions,
  deleteUserOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/react-query"

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
