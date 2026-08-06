import {
  type OAuthContinueOptions,
  type OAuthProviderAuthClient,
  oauthContinueOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseOAuthContinueOptions = Accessor<OAuthContinueOptions>

export function useOAuthContinue<TAuthClient extends OAuthProviderAuthClient>(
  authClient: TAuthClient,
  options?: UseOAuthContinueOptions,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...oauthContinueOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
