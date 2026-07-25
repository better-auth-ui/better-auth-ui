import { oauthProviderQueryKeys } from "@better-auth-ui/core/plugins"
import {
  createQuery,
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken
} from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"

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
    publicOAuthClientOptions(authClient, clientId, params) as never
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
    publicOAuthClientOptions(authClient, clientId, params) as never
  )

export const fetchPublicOAuthClient = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  clientId: string,
  params?: PublicOAuthClientParams<TAuthClient>
) =>
  queryClient.fetchQuery(
    publicOAuthClientOptions(authClient, clientId, params) as never
  )

export type UsePublicOAuthClientOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = PublicOAuthClientOptions<TAuthClient> & PublicOAuthClientParams<TAuthClient>

export function usePublicOAuthClient<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  clientId: () => string | undefined,
  options: UsePublicOAuthClientOptions<TAuthClient> = {}
) {
  return createQuery(() => {
    const { fetchOptions, ...queryOptionsRest } = options
    const currentClientId = clientId()
    const baseOptions = publicOAuthClientOptions(
      authClient,
      currentClientId ?? "",
      { fetchOptions } as PublicOAuthClientParams<TAuthClient>
    )

    return {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: currentClientId ? baseOptions.queryFn : skipToken
    }
  })
}
