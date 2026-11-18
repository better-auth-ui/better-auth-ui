import {
  type OAuthContinueOptions,
  type OAuthProviderAuthClient,
  oauthContinueOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/react-query"

export function useOAuthContinue<
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- public API: callers instantiate this factory with their client type
  TAuthClient extends OAuthProviderAuthClient
>(
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
