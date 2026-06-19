import { multiSessionQueryKeys } from "@better-auth-ui/core/plugins"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { InferData, MultiSessionAuthClient } from "../../lib/auth-client"

export type ListDeviceSessionsData<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = InferData<TAuthClient["multiSession"]["listDeviceSessions"]>

export type ListDeviceSession<
  TAuthClient extends MultiSessionAuthClient = MultiSessionAuthClient
> = NonNullable<ListDeviceSessionsData<TAuthClient>>[number]

export type ListDeviceSessionsParams<
  TAuthClient extends MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["listDeviceSessions"]>[0]

export type ListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
> = Omit<
  ReturnType<typeof listDeviceSessionsOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

/**
 * Query options factory for the current user's device sessions.
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.multiSession.listDeviceSessions`.
 */
export function listDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListDeviceSessionsParams<TAuthClient>
) {
  type TData = ListDeviceSessionsData<TAuthClient>
  const queryKey = multiSessionQueryKeys.list(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.multiSession.listDeviceSessions({
          ...params,
          fetchOptions: { ...params?.fetchOptions, signal, throw: true }
        }) as Promise<TData>
    }
  )

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

/**
 * Get the current user's device sessions from the query cache, calling
 * `fetchListDeviceSessions` under the hood if no cached entry exists.
 * Resolves with the device session list, making it ideal for loaders or
 * `beforeLoad` guards.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.multiSession.listDeviceSessions`.
 */
export const ensureListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListDeviceSessionsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(
    listDeviceSessionsOptions(authClient, userId, params)
  )

/**
 * Prefetch the current user's device sessions into the query cache. Behaves
 * like `fetchListDeviceSessions`, but does not throw on error and does not
 * return the data — use this to warm the cache without blocking navigation.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.multiSession.listDeviceSessions`.
 */
export const prefetchListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListDeviceSessionsParams<TAuthClient>
) =>
  queryClient.prefetchQuery(
    listDeviceSessionsOptions(authClient, userId, params)
  )

/**
 * Fetch and cache the current user's device sessions, resolving with the
 * data or throwing on error. If a cached entry exists and is neither
 * invalidated nor older than `staleTime`, the cached value is returned
 * without a network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.multiSession.listDeviceSessions`.
 */
export const fetchListDeviceSessions = <
  TAuthClient extends MultiSessionAuthClient
>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListDeviceSessionsParams<TAuthClient>
) =>
  queryClient.fetchQuery(listDeviceSessionsOptions(authClient, userId, params))

export type UseListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
> = ListDeviceSessionsOptions<TAuthClient> &
  ListDeviceSessionsParams<TAuthClient>

/**
 * Subscribe to the current user's device sessions (multi-session account
 * switcher) via TanStack Query.
 *
 * Shares a query key with the server-side `listDeviceSessionsOptions`, so
 * SSR-hydrated data is reused from the cache without an immediate refetch.
 * The query is gated on a signed-in user; while the session is loading or
 * absent, the underlying `queryFn` is replaced with `skipToken`.
 *
 * @param authClient - The Better Auth client with the multi-session plugin.
 * @param options - `listDeviceSessions` params (`query`, `fetchOptions`)
 *   merged with `useQuery` options (e.g. `enabled`, `staleTime`, `select`).
 * @param queryClient - Optional custom `QueryClient`. Defaults to the client
 *   from the nearest `QueryClientProvider`.
 */
export function useListDeviceSessions<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  options: UseListDeviceSessionsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = listDeviceSessionsOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...queryOptions,
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
