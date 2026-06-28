import type { DataTag, QueryClient, QueryOptions } from "@tanstack/query-core"
import type { APIError } from "better-auth"
import { multiSessionQueryKeys } from "../../../plugins/multi-session"
import type { MultiSessionAuthServer } from "../../../plugins/multi-session/server/multi-session-auth-server"

export type ListDeviceSessionsData<TAuth extends MultiSessionAuthServer> =
  Awaited<ReturnType<TAuth["api"]["listDeviceSessions"]>>

export type ListDeviceSession<
  TAuth extends MultiSessionAuthServer = MultiSessionAuthServer
> = NonNullable<ListDeviceSessionsData<TAuth>>[number]

export type ListDeviceSessionsParams<TAuth extends MultiSessionAuthServer> =
  Parameters<TAuth["api"]["listDeviceSessions"]>[0]

/**
 * Query options factory for the current user's device sessions.
 *
 * @param auth - The Better Auth server instance with the multi-session plugin.
 * @param userId - The signed-in user's ID. Used for cache partitioning so
 *   the key matches the client-side `listDeviceSessionsOptions` for SSR hydration.
 * @param params - Parameters forwarded to `auth.api.listDeviceSessions`.
 */
export function listDeviceSessionsOptions<TAuth extends MultiSessionAuthServer>(
  auth: TAuth,
  userId: string,
  params: ListDeviceSessionsParams<TAuth>
) {
  type TData = ListDeviceSessionsData<TAuth>
  const queryKey = multiSessionQueryKeys.list(userId, params?.query)

  const options = {
    queryKey,
    queryFn: () => auth.api.listDeviceSessions(params) as Promise<TData>
  } as QueryOptions<TData, APIError, TData, typeof queryKey>

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, APIError>
  }
}

/**
 * Get the current user's device sessions from the query cache, calling
 * `fetchListDeviceSessions` under the hood if no cached entry exists.
 * Resolves with the device session list, making it suitable for reading
 * directly in a server component.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the multi-session plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listDeviceSessions`.
 */
export const ensureListDeviceSessions = <TAuth extends MultiSessionAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListDeviceSessionsParams<TAuth>
) =>
  queryClient.ensureQueryData(listDeviceSessionsOptions(auth, userId, params))

/**
 * Prefetch the current user's device sessions into the query cache. Behaves
 * like `fetchListDeviceSessions`, but does not throw on error and does not
 * return the data — use this when you only need the value to be available
 * after hydration.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the multi-session plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listDeviceSessions`.
 */
export const prefetchListDeviceSessions = <
  TAuth extends MultiSessionAuthServer
>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListDeviceSessionsParams<TAuth>
) => queryClient.prefetchQuery(listDeviceSessionsOptions(auth, userId, params))

/**
 * Fetch and cache the current user's device sessions, resolving with the
 * data or throwing on error. If a cached entry exists and is neither
 * invalidated nor older than `staleTime`, the cached value is returned
 * without a network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client used for SSR hydration.
 * @param auth - The Better Auth server instance with the multi-session plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `auth.api.listDeviceSessions`.
 */
export const fetchListDeviceSessions = <TAuth extends MultiSessionAuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  userId: string,
  params: ListDeviceSessionsParams<TAuth>
) => queryClient.fetchQuery(listDeviceSessionsOptions(auth, userId, params))
