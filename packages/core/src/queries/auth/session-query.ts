import type { QueryClient, QueryOptions } from "@tanstack/query-core"
import type { AuthClient, InferData } from "../../lib/auth-client"
import { authQueryKeys } from "../../lib/auth-query-keys"

export type SessionData<TAuthClient extends AuthClient> = InferData<
  TAuthClient["getSession"]
>

export type SessionParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["getSession"]
>[0]

export type SessionOptions<TAuthClient extends AuthClient> = Partial<
  Omit<QueryOptions<SessionData<TAuthClient>>, "queryKey">
> &
  SessionParams<TAuthClient>

/**
 * Query options factory for the current session.
 *
 * Shares a query key with the server-side `sessionOptions` so that data
 * prefetched during SSR hydrates seamlessly into the client cache.
 *
 * @param authClient - The Better Auth client.
 * @param params - Parameters forwarded to `authClient.getSession`.
 */
export function sessionOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) {
  type TData = SessionData<TAuthClient>
  const queryKey = authQueryKeys.session

  return {
    queryKey,
    queryFn: ({ signal }) =>
      authClient.getSession({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true }
      }) as Promise<TData>
  } satisfies QueryOptions
}

/**
 * Get the current session from the query cache, calling `fetchSession` under
 * the hood if no cached entry exists. Resolves with the session data, making
 * it ideal for loaders or `beforeLoad` guards.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param options - Params forwarded to `authClient.getSession` and query options.
 */
export const ensureSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  options?: SessionOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.ensureQueryData({
    ...sessionOptions(authClient, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Prefetch the current session into the query cache. Behaves like
 * `fetchSession`, but does not throw on error and does not return the data —
 * use this to warm the cache without blocking navigation.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param options - Params forwarded to `authClient.getSession` and query options.
 */
export const prefetchSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  options?: SessionOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.prefetchQuery({
    ...sessionOptions(authClient, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Fetch and cache the current session, resolving with the data or throwing
 * on error. If a cached entry exists and is neither invalidated nor older
 * than `staleTime`, the cached value is returned without a network call;
 * otherwise the latest data is fetched.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param options - Params forwarded to `authClient.getSession` and query options.
 */
export const fetchSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  options?: SessionOptions<TAuthClient>
) => {
  const { fetchOptions, query, ...queryOptions } = options ?? {}

  return queryClient.fetchQuery({
    ...sessionOptions(authClient, { query, fetchOptions }),
    ...queryOptions
  })
}

/**
 * Read the current session synchronously from the query cache without
 * triggering a fetch. Returns the cached session data, or `undefined` when
 * no entry exists — use this for non-suspending reads where a network call
 * is undesirable.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 */
export const getSession = <TAuthClient extends AuthClient = AuthClient>(
  queryClient: QueryClient,
  _authClient?: TAuthClient
) => {
  const queryKey = authQueryKeys.session
  return queryClient.getQueryData<SessionData<TAuthClient>>(queryKey)
}
