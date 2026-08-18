import {
  type SignInSsoOptions,
  type SsoAuthClient,
  signInSsoOptions
} from "@better-auth-ui/core/plugins/sso"
import { useMutation } from "@tanstack/react-query"

/** Create a mutation for discovering and starting SSO sign-in. */
export function useSignInSso<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: SignInSsoOptions<TAuthClient>
) {
  return useMutation({
    ...signInSsoOptions(authClient),
    ...options
  })
}
