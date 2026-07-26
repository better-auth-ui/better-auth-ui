import { oauthProviderQueryKeys } from "@better-auth-ui/core/plugins"
import type { QueryClient } from "@tanstack/solid-query"

import type { InferData, OAuthProviderAuthClient } from "../../lib/auth-client"
import { useSession } from "../auth/session-query"
import {
  createUserScopedOptions,
  createUserScopedQuery,
  ensureUserScopedQuery,
  fetchUserScopedQuery,
  getSessionUserId,
  prefetchUserScopedQuery
} from "../create-user-scoped-query"

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
  return createUserScopedOptions(
    oauthProviderQueryKeys.listConsents(userId),
    authClient.oauth2.getConsents,
    params
  )
}

export const ensureListOAuthConsents = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOAuthConsentsParams<TAuthClient>
) =>
  ensureUserScopedQuery(
    queryClient,
    oauthProviderQueryKeys.listConsents(userId),
    authClient.oauth2.getConsents,
    params
  )

export const prefetchListOAuthConsents = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOAuthConsentsParams<TAuthClient>
) =>
  prefetchUserScopedQuery(
    queryClient,
    oauthProviderQueryKeys.listConsents(userId),
    authClient.oauth2.getConsents,
    params
  )

export const fetchListOAuthConsents = <
  TAuthClient extends OAuthProviderAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListOAuthConsentsParams<TAuthClient>
) =>
  fetchUserScopedQuery(
    queryClient,
    oauthProviderQueryKeys.listConsents(userId),
    authClient.oauth2.getConsents,
    params
  )

export type UseListOAuthConsentsOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = ListOAuthConsentsOptions<TAuthClient> & ListOAuthConsentsParams<TAuthClient>

/**
 * Subscribe to the OAuth applications the signed-in user has authorized.
 *
 * The query is gated on a signed-in user; while the session is loading or
 * absent the underlying `queryFn` is replaced with `skipToken`.
 */
export function useListOAuthConsents<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  options: UseListOAuthConsentsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { fetchOptions, ...queryOptionsRest } = options

  return createUserScopedQuery(
    () => oauthProviderQueryKeys.listConsents(userId()),
    authClient.oauth2.getConsents,
    () => ({ fetchOptions }) as ListOAuthConsentsParams<TAuthClient>,
    () => Boolean(userId()),
    () => queryOptionsRest
  )
}
