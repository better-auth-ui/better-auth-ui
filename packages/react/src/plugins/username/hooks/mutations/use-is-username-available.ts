import {
  type IsUsernameAvailableOptions,
  isUsernameAvailableOptions,
  type UsernameAuthClient
} from "@better-auth-ui/core/plugins/username"
import { useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for checking whether a username is available.
 *
 * Wraps `authClient.isUsernameAvailable` and forwards React Query mutation
 * options such as `onSuccess`, `onError`, and `retry`.
 *
 * @param authClient - The Better Auth client with the username plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useIsUsernameAvailable<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient,
  options?: IsUsernameAvailableOptions<TAuthClient>
) {
  return useMutation({
    ...isUsernameAvailableOptions(authClient),
    ...options
  })
}
