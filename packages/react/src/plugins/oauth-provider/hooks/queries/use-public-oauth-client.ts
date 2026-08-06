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
  const { fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...publicOAuthClientOptions(authClient, clientId, {
        fetchOptions
      } as PublicOAuthClientParams<TAuthClient>),
      ...queryOptions
    },
    queryClient
  )
}
