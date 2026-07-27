import {
  type AnonymousAuthClient,
  type SignInAnonymousOptions,
  signInAnonymousOptions
} from "@better-auth-ui/core/plugins/anonymous"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/** Create a mutation for signing in with an anonymous guest account. */
export function useSignInAnonymous<TAuthClient extends AnonymousAuthClient>(
  authClient: TAuthClient,
  options?: SignInAnonymousOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInAnonymousOptions(authClient),
      ...options
    },
    queryClient
  )
}
