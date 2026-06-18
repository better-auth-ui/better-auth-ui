import { authQueryKeys } from "@better-auth-ui/core"
import {
  type DataTag,
  type QueryClient,
  queryOptions,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

import type { AuthClient, InferData } from "../../lib/auth-client"

export type SessionData<TAuthClient extends AuthClient = AuthClient> =
  InferData<TAuthClient["getSession"]>

export type Session<TAuthClient extends AuthClient = AuthClient> = NonNullable<
  SessionData<TAuthClient>
>

export type SessionParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["getSession"]
>[0]

export type SessionOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof sessionOptions<TAuthClient>>,
  "queryKey" | "queryFn"
>

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

  const options = queryOptions<TData, BetterFetchError, TData, typeof queryKey>(
    {
      queryKey,
      queryFn: ({ signal }) =>
        authClient.getSession({
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
 * Get the current session from the query cache, calling `fetchSession` under
 * the hood if no cached entry exists. Resolves with the session data, making
 * it ideal for loaders or `beforeLoad` guards.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param params - Parameters forwarded to `authClient.getSession`.
 */
export const ensureSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.ensureQueryData(sessionOptions(authClient, params))

/**
 * Prefetch the current session into the query cache. Behaves like
 * `fetchSession`, but does not throw on error and does not return the data —
 * use this to warm the cache without blocking navigation.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param params - Parameters forwarded to `authClient.getSession`.
 */
export const prefetchSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.prefetchQuery(sessionOptions(authClient, params))

/**
 * Fetch and cache the current session, resolving with the data or throwing
 * on error. If a cached entry exists and is neither invalidated nor older
 * than `staleTime`, the cached value is returned without a network call;
 * otherwise the latest data is fetched.
 *
 * @param queryClient - The React Query client.
 * @param authClient - The Better Auth client.
 * @param params - Parameters forwarded to `authClient.getSession`.
 */
export const fetchSession = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.fetchQuery(sessionOptions(authClient, params))

export type UseSessionOptions<TAuthClient extends AuthClient> =
  SessionOptions<TAuthClient> & SessionParams<TAuthClient>

/**
 * Subscribe to the current session via TanStack Query.
 *
 * Shares a query key with the server-side `sessionOptions`, so SSR-hydrated
 * session data is reused from the cache without an immediate refetch.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params (`query`, `fetchOptions`) merged
 *   with `useQuery` options (e.g. `enabled`, `staleTime`, `select`).
 * @param queryClient - Optional custom `QueryClient`. Defaults to the client
 *   from the nearest `QueryClientProvider`.
 */
export function useSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseSessionOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...sessionOptions(authClient, { query, fetchOptions }),
      ...queryOptions
    },
    queryClient
  )
}
