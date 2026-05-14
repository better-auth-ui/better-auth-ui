import { authQueryKeys } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import type { ApiKeyAuthClient, InferData } from "../../lib/auth-client"
import { useSession } from "../auth/session-query"
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
    authQueryKeys.listApiKeys(userId, params?.query),
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
    authQueryKeys.listApiKeys(userId, params?.query),
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
    authQueryKeys.listApiKeys(userId, params?.query),
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
    authQueryKeys.listApiKeys(userId, params?.query),
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
    () => authQueryKeys.listApiKeys(userId(), query),
    authClient.apiKey.list,
    () => ({ query, fetchOptions }) as ListApiKeysParams<TAuthClient>,
    () => Boolean(userId()),
    () => queryOptionsRest
  )
}
