import {
  type AuthClient,
  type SignInEmailOptions,
  signInEmailOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for email/password sign-in.
 */
export function useSignInEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignInEmailOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInEmailOptions(authClient),
      ...options
    },
    queryClient
  )
}
