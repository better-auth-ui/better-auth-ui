import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { MultiSessionAuthClient } from "./multi-session-auth-client"
import { multiSessionQueryKeys } from "./multi-session-query-keys"

export type ListDeviceSessionsData<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = InferData<TAuthClient["multiSession"]["listDeviceSessions"]>

export type ListDeviceSession<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = NonNullable<ListDeviceSessionsData<TAuthClient>>[number]

export type ListDeviceSessionsParams<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["listDeviceSessions"]>[0]

export type ListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = Omit<QueryOptions<ListDeviceSessionsData<TAuthClient>>, "queryKey"> &
  ListDeviceSessionsParams<TAuthClient>

export function listDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListDeviceSessionsParams<TAuthClient>
) {
  type TData = ListDeviceSessionsData<TAuthClient>
  const queryKey = multiSessionQueryKeys.list(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.multiSession.listDeviceSessions({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

export const ensureListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListDeviceSessionsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listDeviceSessionsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const prefetchListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListDeviceSessionsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listDeviceSessionsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

export const fetchListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListDeviceSessionsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listDeviceSessionsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}
export const getListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListDeviceSessionsParams<TAuthClient>
) => {
  const queryKey = multiSessionQueryKeys.list(userId, params?.query)
  return queryClient.getQueryData<ListDeviceSessionsData<TAuthClient>>(queryKey)
}
