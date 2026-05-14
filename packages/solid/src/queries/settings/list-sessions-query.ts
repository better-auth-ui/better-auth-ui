import { authQueryKeys } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import type { AuthClient, InferData } from "../../lib/auth-client"
import { useSession } from "../auth/session-query"
import {
  createUserScopedOptions,
  createUserScopedQuery,
  ensureUserScopedQuery,
  fetchUserScopedQuery,
  getSessionUserId,
  prefetchUserScopedQuery
} from "../create-user-scoped-query"

export type ListSessionsData<TAuthClient extends AuthClient> = InferData<
  TAuthClient["listSessions"]
>
export type ListSessionsParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["listSessions"]
>[0]
export type ListSession<TAuthClient extends AuthClient = AuthClient> =
  NonNullable<ListSessionsData<TAuthClient>>[number]
export type ListSessionsOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof listSessionsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listSessionsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListSessionsParams<TAuthClient>
) {
  return createUserScopedOptions(
    authQueryKeys.listSessions(userId, params?.query),
    authClient.listSessions,
    params
  )
}

export const ensureListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) =>
  ensureUserScopedQuery(
    queryClient,
    authQueryKeys.listSessions(userId, params?.query),
    authClient.listSessions,
    params
  )

export const prefetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) =>
  prefetchUserScopedQuery(
    queryClient,
    authQueryKeys.listSessions(userId, params?.query),
    authClient.listSessions,
    params
  )

export const fetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) =>
  fetchUserScopedQuery(
    queryClient,
    authQueryKeys.listSessions(userId, params?.query),
    authClient.listSessions,
    params
  )

export type UseListSessionsOptions<TAuthClient extends AuthClient> =
  ListSessionsOptions<TAuthClient> & ListSessionsParams<TAuthClient>

export function useListSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListSessionsOptions<TAuthClient> = {}
) {
  const session = useSession(authClient)
  const userId = () => getSessionUserId(session)
  const { query, fetchOptions, ...queryOptionsRest } = options

  return createUserScopedQuery(
    () => authQueryKeys.listSessions(userId(), query),
    authClient.listSessions,
    () => ({ query, fetchOptions }) as ListSessionsParams<TAuthClient>,
    () => Boolean(userId()),
    () => queryOptionsRest
  )
}
