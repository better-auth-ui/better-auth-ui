import {
  type OAuthPopupAuthClient,
  type SignInOAuthPopupOptions,
  signInOAuthPopupOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/** Create a mutation for Better Auth's experimental OAuth popup flow. */
export function useSignInOAuthPopup<TAuthClient extends OAuthPopupAuthClient>(
  authClient: TAuthClient,
  options?: SignInOAuthPopupOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInOAuthPopupOptions(authClient),
      ...options
    },
    queryClient
  )
}
