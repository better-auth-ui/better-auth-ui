import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { AuthClient, InferData } from "../lib/auth-client"
import { authQueryKeys } from "../lib/auth-query-keys"

export type ListSessionsData<TAuthClient extends AuthClient = AuthClient> =
  InferData<TAuthClient["listSessions"]>

export type ListSessionsParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["listSessions"]
>[0]

export type ListSessionsOptions<TAuthClient extends AuthClient> = Partial<
  Omit<QueryOptions<ListSessionsData<TAuthClient>>, "queryKey">
> &
  ListSessionsParams<TAuthClient>

export type ListSession<TAuthClient extends AuthClient = AuthClient> =
  NonNullable<ListSessionsData<TAuthClient>>[number]

/**
 * Query options factory for the current user's active sessions.
 *
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Parameters forwarded to `authClient.listSessions`.
 */
export function listSessionsOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  userId?: string,
  params?: ListSessionsParams<TAuthClient>
) {
  type TData = ListSessionsData<TAuthClient>
  const queryKey = authQueryKeys.listSessions(userId, params?.query)

  return {
    queryKey,
    queryFn: userId
      ? ({ signal }) =>
          authClient.listSessions({
            ...params,
            fetchOptions: { ...params?.fetchOptions, signal, throw: true }
          }) as Promise<TData>
      : skipToken
  } satisfies QueryOptions
}

/**
 * Get the current user's active sessions from the query cache, calling
 * `fetchListSessions` under the hood if no cached entry exists. Resolves with
 * the sessions data, making it ideal for loaders or `beforeLoad` guards.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param options - Params forwarded to `authClient.listSessions` and query options.
 */
export const ensureListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListSessionsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...listSessionsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Prefetch the current user's active sessions into the query cache. Behaves
 * like `fetchListSessions`, but does not throw on error and does not return
 * the data — use this to warm the cache without blocking navigation.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param options - Params forwarded to `authClient.listSessions` and query options.
 */
export const prefetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListSessionsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...listSessionsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Fetch and cache the current user's active sessions, resolving with the data
 * or throwing on error. If a cached entry exists and is neither invalidated
 * nor older than `staleTime`, the cached value is returned without a network
 * call; otherwise the latest data is fetched.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param options - Params forwarded to `authClient.listSessions` and query options.
 */
export const fetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId?: string,
  options?: ListSessionsOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...listSessionsOptions(authClient, userId, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Read the current user's active sessions synchronously from the query cache
 * without triggering a fetch. Returns the cached sessions data, or `undefined`
 * when no entry exists — use this for non-suspending reads where a network
 * call is undesirable.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 * @param params - Params forwarded to `authClient.listSessions`.
 */
export const getListSessions = <TAuthClient extends AuthClient = AuthClient>(
  queryClient: QueryClient,
  _authClient?: TAuthClient,
  userId?: string,
  params?: ListSessionsParams<TAuthClient>
) => {
  const queryKey = authQueryKeys.listSessions(userId, params?.query)
  return queryClient.getQueryData<ListSessionsData<TAuthClient>>(queryKey)
}
