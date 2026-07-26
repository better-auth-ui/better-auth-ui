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
import { useSession } from "../auth/session-query"

export type ListOAuthConsentsData<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = InferData<TAuthClient["oauth2"]["getConsents"]>

export type ListedOAuthConsent<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = NonNullable<ListOAuthConsentsData<TAuthClient>>[number]

export type ListOAuthConsentsParams<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Parameters<TAuthClient["oauth2"]["getConsents"]>[0]

export type ListOAuthConsentsOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Omit<
  ReturnType<typeof listOAuthConsentsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for the OAuth applications the user has authorized.
 *
 * @param authClient - The Better Auth client with the OAuth provider plugin.
 * @param userId - The signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `oauth2.getConsents`.
 */
export function listOAuthConsentsOptions<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListOAuthConsentsParams<TAuthClient>
) {
  type TData = ListOAuthConsentsData<TAuthClient>
  const queryKey = oauthProviderQueryKeys.listConsents(userId)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.oauth2.getConsents({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

export const ensureListOAuthConsents = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOAuthConsentsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    listOAuthConsentsOptions(authClient, userId, params)
  )

export const prefetchListOAuthConsents = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOAuthConsentsParams<TAuthClient>
) =>
  queryClient.prefetchQuery(
    listOAuthConsentsOptions(authClient, userId, params)
  )

export const fetchListOAuthConsents = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOAuthConsentsParams<TAuthClient>
) =>
  queryClient.fetchQuery(listOAuthConsentsOptions(authClient, userId, params))

export type UseListOAuthConsentsOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = ListOAuthConsentsOptions<TAuthClient> & ListOAuthConsentsParams<TAuthClient>

/**
 * Subscribe to the OAuth applications the signed-in user has authorized.
 *
 * The query is gated on a signed-in user; while the session is loading or
 * absent the underlying `queryFn` is replaced with `skipToken`.
 *
 * @param authClient - The Better Auth client with the OAuth provider plugin.
 * @param options - `oauth2.getConsents` params merged with `useQuery` options.
 * @param queryClient - Optional custom `QueryClient`.
 */
export function useListOAuthConsents<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  options: UseListOAuthConsentsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { fetchOptions, ...queryOptionsRest } = options

  const baseOptions = listOAuthConsentsOptions(authClient, userId, {
    fetchOptions
  } as ListOAuthConsentsParams<TAuthClient>)

  return useQuery(
    {
      ...queryOptionsRest,
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
