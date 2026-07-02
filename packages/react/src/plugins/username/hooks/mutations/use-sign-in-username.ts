import {
  type SignInUsernameOptions,
  signInUsernameOptions,
  type UsernameAuthClient
} from "@better-auth-ui/core/plugins/username"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for username/password sign-in.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session
 * query so the new session is refetched (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the username plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInUsername<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient,
  options?: SignInUsernameOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInUsernameOptions(authClient),
      ...options
    },
    queryClient
  )
}
