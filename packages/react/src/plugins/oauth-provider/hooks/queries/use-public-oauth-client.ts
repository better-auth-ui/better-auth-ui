import {
  type OAuthProviderAuthClient,
  type PublicOAuthClientData,
  type PublicOAuthClientParams,
  publicOAuthClientOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"

export type UsePublicOAuthClientOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Omit<UseQueryOptions<PublicOAuthClientData<TAuthClient>>, "queryKey"> &
  PublicOAuthClientParams<TAuthClient>

/**
 * Subscribe to an OAuth application's public metadata.
 *
 * The query stays disabled until a client ID is available.
 */
export function usePublicOAuthClient<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  clientId: string | undefined,
  options: UsePublicOAuthClientOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { fetchOptions, oauthQuery, ...queryOptions } = options

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- rebuilds the generic params from their own fields
  const params = {
    fetchOptions,
    oauthQuery
  } as PublicOAuthClientParams<TAuthClient>

  return useQuery(
    {
      ...publicOAuthClientOptions(authClient, clientId, params),
      ...queryOptions
    },
    queryClient
  )
}
