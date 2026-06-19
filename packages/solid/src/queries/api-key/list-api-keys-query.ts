import { apiKeyQueryKeys } from "@better-auth-ui/core/plugins"
import type { QueryClient } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { ApiKeyAuthClient, InferData } from "../../lib/auth-client"
import {
  createUserScopedOptions,
  createUserScopedQuery,
  ensureUserScopedQuery,
  fetchUserScopedQuery,
  getSessionUserId,
  prefetchUserScopedQuery
} from "../create-user-scoped-query"

export type ListApiKeysData<TAuthClient extends ApiKeyAuthClient> = InferData<
  TAuthClient["apiKey"]["list"]
>
export type ListApiKeysParams<TAuthClient extends ApiKeyAuthClient> =
  Parameters<TAuthClient["apiKey"]["list"]>[0]
export type ListApiKeysOptions<TAuthClient extends ApiKeyAuthClient> = Omit<
  ReturnType<typeof listApiKeysOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listApiKeysOptions<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListApiKeysParams<TAuthClient>
) {
  return createUserScopedOptions(
    apiKeyQueryKeys.list(userId, params?.query),
    authClient.apiKey.list,
    params
  )
}

export const ensureListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListApiKeysParams<TAuthClient>
) =>
  ensureUserScopedQuery(
    queryClient,
    apiKeyQueryKeys.list(userId, params?.query),
    authClient.apiKey.list,
    params
  )

export const prefetchListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListApiKeysParams<TAuthClient>
) =>
  prefetchUserScopedQuery(
    queryClient,
    apiKeyQueryKeys.list(userId, params?.query),
    authClient.apiKey.list,
    params
  )

export const fetchListApiKeys = <TAuthClient extends ApiKeyAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListApiKeysParams<TAuthClient>
) =>
  fetchUserScopedQuery(
    queryClient,
    apiKeyQueryKeys.list(userId, params?.query),
    authClient.apiKey.list,
    params
  )

export type UseListApiKeysOptions<TAuthClient extends ApiKeyAuthClient> =
  ListApiKeysOptions<TAuthClient> & ListApiKeysParams<TAuthClient>

export function useListApiKeys<TAuthClient extends ApiKeyAuthClient>(
  authClient: TAuthClient,
  options: UseListApiKeysOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, ...queryOptionsRest } = options

  return createUserScopedQuery(
    () => apiKeyQueryKeys.list(userId(), query),
    authClient.apiKey.list,
    () => ({ query, fetchOptions }) as ListApiKeysParams<TAuthClient>,
    () => Boolean(userId()),
    () => queryOptionsRest
  )
}
