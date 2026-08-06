import {
  type AuthClient,
  type SignOutOptions,
  signOutOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for signing the current user out.
 */
export function useSignOut<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignOutOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signOutOptions(authClient),
      ...options
    },
    queryClient
  )
}
