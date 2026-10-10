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
> & {
  /**
   * The complete signed authorization query, including `sig` and `exp`.
   * Uses `publicClientPrelogin` to verify the query before returning metadata.
   * Requires `allowPublicClientPrelogin: true` on the OAuth provider server.
   */
  oauthQuery?: string
}

export type PublicOAuthClientOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Omit<QueryOptions<PublicOAuthClientData<TAuthClient>>, "queryKey"> &
  PublicOAuthClientParams<TAuthClient>

/**
 * Query options factory for an OAuth application's public metadata.
 *
 * @param authClient - The Better Auth client with the OAuth provider plugin.
 * @param clientId - The OAuth client ID from the signed authorization request.
 * @param params - Fetch options and an optional signed authorization query.
 */
export function publicOAuthClientOptions<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  clientId: string | undefined,
  params?: PublicOAuthClientParams<TAuthClient>
) {
  type TData = PublicOAuthClientData<TAuthClient>
  const { oauthQuery, ...clientParams } = params ?? {}
  const queryKey = oauthProviderQueryKeys.publicClient(clientId, oauthQuery)

  return {
    queryKey,
    queryFn: clientId
      ? ({ signal }) => {
          // The endpoint verifies oauth_query, but client_id is a separate body field.
          if (oauthQuery !== undefined) {
            const clientIds = new URLSearchParams(oauthQuery).getAll(
              "client_id"
            )
            if (clientIds.length !== 1 || clientIds[0] !== clientId) {
              throw new Error(
                "OAuth client ID does not match the authorization request."
              )
            }
          }
          const fetchOptions = createAuthQueryFetchOptions(
            params?.fetchOptions,
            signal
          )
          return (
            oauthQuery !== undefined
              ? authClient.oauth2.publicClientPrelogin({
                  client_id: clientId,
                  oauth_query: oauthQuery,
                  fetchOptions
                })
              : authClient.oauth2.publicClient({
                  ...clientParams,
                  query: { client_id: clientId },
                  fetchOptions
                })
          ) as Promise<TData>
        }
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
  const { fetchOptions, oauthQuery, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...publicOAuthClientOptions(authClient, clientId, {
      fetchOptions,
      oauthQuery
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
  const { fetchOptions, oauthQuery, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...publicOAuthClientOptions(authClient, clientId, {
      fetchOptions,
      oauthQuery
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
  const { fetchOptions, oauthQuery, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...publicOAuthClientOptions(authClient, clientId, {
      fetchOptions,
      oauthQuery
    } as PublicOAuthClientParams<TAuthClient>),
    ...queryOptions
  })
}
