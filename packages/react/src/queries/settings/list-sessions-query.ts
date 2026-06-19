import { authQueryKeys } from "@better-auth-ui/core"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  skipToken,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { AuthClient, InferData } from "../../lib/auth-client"

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

/**
 * Query options factory for the current user's active sessions.
 *
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listSessions`.
 */
export function listSessionsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId: string | undefined,
  params?: ListSessionsParams<TAuthClient>
) {
  type TData = ListSessionsData<TAuthClient>
  const queryKey = authQueryKeys.listSessions(userId, params?.query)

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.listSessions({
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
 * Get the current user's active sessions from the query cache, calling
 * `fetchListSessions` under the hood if no cached entry exists. Resolves
 * with the session list, making it ideal for loaders or `beforeLoad` guards.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listSessions`.
 */
export const ensureListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listSessionsOptions(authClient, userId, params))

/**
 * Prefetch the current user's active sessions into the query cache. Behaves
 * like `fetchListSessions`, but does not throw on error and does not return
 * the data — use this to warm the cache without blocking navigation.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listSessions`.
 */
export const prefetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) => queryClient.prefetchQuery(listSessionsOptions(authClient, userId, params))

/**
 * Fetch and cache the current user's active sessions, resolving with the
 * data or throwing on error. If a cached entry exists and is neither
 * invalidated nor older than `staleTime`, the cached value is returned
 * without a network call; otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The signed-in user's ID, used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listSessions`.
 */
export const fetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) => queryClient.fetchQuery(listSessionsOptions(authClient, userId, params))

export type UseListSessionsOptions<TAuthClient extends AuthClient> =
  ListSessionsOptions<TAuthClient> & ListSessionsParams<TAuthClient>

/**
 * Subscribe to the current user's active sessions via TanStack Query.
 *
 * Shares a query key with the server-side `listSessionsOptions`, so
 * SSR-hydrated data is reused from the cache without an immediate refetch.
 * The query is gated on a signed-in user; while the session is loading or
 * absent, the underlying `queryFn` is replaced with `skipToken`.
 *
 * @param authClient - The Better Auth client.
 * @param options - `listSessions` params (`query`, `fetchOptions`) merged
 *   with `useQuery` options (e.g. `enabled`, `staleTime`, `select`).
 * @param queryClient - Optional custom `QueryClient`. Defaults to the client
 *   from the nearest `QueryClientProvider`.
 */
export function useListSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListSessionsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = listSessionsOptions(authClient, userId, {
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
