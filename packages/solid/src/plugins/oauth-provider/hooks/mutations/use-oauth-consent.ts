import {
  type OAuthConsentOptions,
  type OAuthProviderAuthClient,
  oauthConsentOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseOAuthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient
> = Accessor<OAuthConsentOptions<TAuthClient>>

export function useOAuthConsent<TAuthClient extends OAuthProviderAuthClient>(
  authClient: TAuthClient,
  options?: UseOAuthConsentOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...oauthConsentOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
