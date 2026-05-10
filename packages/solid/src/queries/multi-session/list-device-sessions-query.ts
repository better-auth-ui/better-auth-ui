import { authQueryKeys } from "@better-auth-ui/core"
import type { QueryClient } from "@tanstack/solid-query"
import type { InferData, MultiSessionAuthClient } from "../../lib/auth-client"
import {
  createUserScopedOptions,
  createUserScopedQuery,
  ensureUserScopedQuery,
  fetchUserScopedQuery,
  getUserId,
  prefetchUserScopedQuery
} from "../create-user-scoped-query"

export type ListDeviceSessionsData<TAuthClient extends MultiSessionAuthClient> =
  InferData<TAuthClient["multiSession"]["listDeviceSessions"]>
export type ListDeviceSessionsParams<
  TAuthClient extends MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["listDeviceSessions"]>[0]
export type ListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
> = Omit<
  ReturnType<typeof listDeviceSessionsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

export function listDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListDeviceSessionsParams<TAuthClient>
) {
  return createUserScopedOptions(
    authQueryKeys.listDeviceSessions(userId, params?.query),
    authClient.multiSession.listDeviceSessions,
    params
  )
}

export const ensureListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListDeviceSessionsParams<TAuthClient>
) =>
  ensureUserScopedQuery(
    queryClient,
    authQueryKeys.listDeviceSessions(userId, params?.query),
    authClient.multiSession.listDeviceSessions,
    params
  )

export const prefetchListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListDeviceSessionsParams<TAuthClient>
) =>
  prefetchUserScopedQuery(
    queryClient,
    authQueryKeys.listDeviceSessions(userId, params?.query),
    authClient.multiSession.listDeviceSessions,
    params
  )

export const fetchListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListDeviceSessionsParams<TAuthClient>
) =>
  fetchUserScopedQuery(
    queryClient,
    authQueryKeys.listDeviceSessions(userId, params?.query),
    authClient.multiSession.listDeviceSessions,
    params
  )

export type UseListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
> = ListDeviceSessionsOptions<TAuthClient> &
  ListDeviceSessionsParams<TAuthClient>

export function useListDeviceSessions<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  options: UseListDeviceSessionsOptions<TAuthClient> = {}
) {
  const userId = () => getUserId(authClient)
  const { query, fetchOptions, ...queryOptionsRest } = options

  return createUserScopedQuery(
    () => authQueryKeys.listDeviceSessions(userId(), query),
    authClient.multiSession.listDeviceSessions,
    () => ({ query, fetchOptions }) as ListDeviceSessionsParams<TAuthClient>,
    () => Boolean(userId()),
    () => queryOptionsRest
  )
}
