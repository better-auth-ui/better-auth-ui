import { oauthProviderQueryKeys } from "@better-auth-ui/core/plugins"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { InferData, OAuthProviderAuthClient } from "../../lib/auth-client"

export type PublicOAuthClientData<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = InferData<TAuthClient["oauth2"]["publicClient"]>

export type PublicOAuthClientParams<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Partial<
  Omit<
    NonNullable<Parameters<TAuthClient["oauth2"]["publicClient"]>[0]>,
    "query"
  >
>

export type PublicOAuthClientOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Omit<
  ReturnType<typeof publicOAuthClientOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for an OAuth application's public metadata.
 *
 * @param authClient - The Better Auth client with the OAuth provider plugin.
 * @param clientId - The OAuth client ID from the signed authorization request.
 * @param params - Fetch options forwarded to `oauth2.publicClient`.
 */
export function publicOAuthClientOptions<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  clientId: string,
  params?: PublicOAuthClientParams<TAuthClient>
) {
  type TData = PublicOAuthClientData<TAuthClient>
  const queryKey = oauthProviderQueryKeys.publicClient(clientId)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.oauth2.publicClient({
          ...params,
          query: { client_id: clientId },
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensurePublicOAuthClient = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  clientId: string,
  params?: PublicOAuthClientParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    publicOAuthClientOptions(authClient, clientId, params)
  )

export const prefetchPublicOAuthClient = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  clientId: string,
  params?: PublicOAuthClientParams<TAuthClient>
) =>
  queryClient.prefetchQuery(
    publicOAuthClientOptions(authClient, clientId, params)
  )

export const fetchPublicOAuthClient = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  clientId: string,
  params?: PublicOAuthClientParams<TAuthClient>
) =>
  queryClient.fetchQuery(publicOAuthClientOptions(authClient, clientId, params))

export type UsePublicOAuthClientOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = PublicOAuthClientOptions<TAuthClient> & PublicOAuthClientParams<TAuthClient>

/**
 * Subscribe to an OAuth application's public metadata.
 *
 * The query is disabled until a client ID is available.
 */
export function usePublicOAuthClient<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  clientId: string | undefined,
  options: UsePublicOAuthClientOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { fetchOptions, ...queryOptionsRest } = options
  const baseOptions = publicOAuthClientOptions(authClient, clientId ?? "", {
    fetchOptions
  } as PublicOAuthClientParams<TAuthClient>)

  return useQuery(
    {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: clientId ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
