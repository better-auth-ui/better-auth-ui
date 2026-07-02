import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { MultiSessionAuthClient } from "./multi-session-auth-client"
import { multiSessionQueryKeys } from "./multi-session-query-keys"

/**
 * Data returned by the Better Auth device sessions endpoint.
 */
export type ListDeviceSessionsData<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = InferData<TAuthClient["multiSession"]["listDeviceSessions"]>

/**
 * Single device session item returned by the device sessions endpoint.
 */
export type ListDeviceSession<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = NonNullable<ListDeviceSessionsData<TAuthClient>>[number]

/**
 * Parameters accepted by the Better Auth device sessions endpoint.
 */
export type ListDeviceSessionsParams<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["listDeviceSessions"]>[0]

/**
 * Query options for listing device sessions, excluding the generated query key.
 */
export type ListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = Omit<QueryOptions<ListDeviceSessionsData<TAuthClient>>, "queryKey"> &
  ListDeviceSessionsParams<TAuthClient>

/**
 * Query options factory for listing the current user's device sessions.
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to the device sessions endpoint.
 */
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

/**
 * Get device sessions from cache, fetching them if needed.
 */
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

/**
 * Prefetch device sessions into the query cache.
 */
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

/**
 * Fetch and cache device sessions, resolving with data or throwing.
 */
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
/**
 * Read device sessions synchronously from the query cache.
 */
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
