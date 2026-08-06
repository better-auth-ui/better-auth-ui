import {
  type OAuthContinueOptions,
  type OAuthProviderAuthClient,
  oauthContinueOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useOAuthContinue<TAuthClient extends OAuthProviderAuthClient>(
  authClient: TAuthClient,
  options?: OAuthContinueOptions,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...oauthContinueOptions(authClient),
      ...options
    },
    queryClient
  )
}
