import {
  type OAuthConsentOptions,
  type OAuthProviderAuthClient,
  oauthConsentOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useOAuthConsent<TAuthClient extends OAuthProviderAuthClient>(
  authClient: TAuthClient,
  options?: OAuthConsentOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...oauthConsentOptions(authClient),
      ...options
    },
    queryClient
  )
}
