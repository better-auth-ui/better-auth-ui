import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import { createAuthQueryFetchOptions } from "../../lib/auth-query-retry"
import type { OAuthProviderAuthClient } from "./oauth-provider-auth-client"
import { oauthProviderQueryKeys } from "./oauth-provider-query-keys"

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
> = Omit<QueryOptions<PublicOAuthClientData<TAuthClient>>, "queryKey"> &
  PublicOAuthClientParams<TAuthClient>

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
  clientId: string | undefined,
  params?: PublicOAuthClientParams<TAuthClient>
) {
  type TData = PublicOAuthClientData<TAuthClient>
  const queryKey = oauthProviderQueryKeys.publicClient(clientId)

  return {
    queryKey,
    queryFn: clientId
      ? ({ signal }) =>
          authClient.oauth2.publicClient({
            ...params,
            query: { client_id: clientId },
            fetchOptions: createAuthQueryFetchOptions(
              params?.fetchOptions,
              signal
            )
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensurePublicOAuthClient = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  clientId: string,
  options?: PublicOAuthClientOptions<TAuthClient>
) => {
  const { fetchOptions, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...publicOAuthClientOptions(authClient, clientId, {
      fetchOptions
    } as PublicOAuthClientParams<TAuthClient>),
    ...queryOptions
  })
}

export const prefetchPublicOAuthClient = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  clientId: string,
  options?: PublicOAuthClientOptions<TAuthClient>
) => {
  const { fetchOptions, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...publicOAuthClientOptions(authClient, clientId, {
      fetchOptions
    } as PublicOAuthClientParams<TAuthClient>),
    ...queryOptions
  })
}

export const fetchPublicOAuthClient = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  clientId: string,
  options?: PublicOAuthClientOptions<TAuthClient>
) => {
  const { fetchOptions, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...publicOAuthClientOptions(authClient, clientId, {
      fetchOptions
    } as PublicOAuthClientParams<TAuthClient>),
    ...queryOptions
  })
}
