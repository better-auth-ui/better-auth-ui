import {
  type AuthClient,
  type SignInSocialOptions,
  signInSocialOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for social sign-in.
 */
export function useSignInSocial<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignInSocialOptions<TAuthClient>
) {
  return useMutation({
    ...signInSocialOptions(authClient),
    ...options
  })
}
