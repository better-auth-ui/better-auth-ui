import type { DataTag, QueryClient, QueryOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient, InferData } from "../../lib/auth-client"
import { authQueryKeys } from "../../lib/auth-query-keys"

export type SessionAuthClient = Pick<AuthClient, "getSession">

export type SessionData<TAuthClient extends SessionAuthClient = AuthClient> =
  InferData<TAuthClient["getSession"]>

export type Session<TAuthClient extends SessionAuthClient = AuthClient> =
  NonNullable<SessionData<TAuthClient>>

export type SessionParams<TAuthClient extends SessionAuthClient> = Parameters<
  TAuthClient["getSession"]
>[0]

export type SessionOptions<TAuthClient extends SessionAuthClient> = Omit<
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
export function sessionOptions<TAuthClient extends SessionAuthClient>(
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) {
  type TData = SessionData<TAuthClient>
  const queryKey = authQueryKeys.session

  const options = {
    queryKey,
    queryFn: ({ signal }) =>
      authClient.getSession({
        ...params,
        fetchOptions: { ...params?.fetchOptions, signal, throw: true }
      })
  } as QueryOptions<TData, BetterFetchError, TData, typeof queryKey>

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, BetterFetchError>
  }
}

/**
 * Get the current session from the query cache, calling `fetchSession` under
 * the hood if no cached entry exists. Resolves with the session data, making
 * it ideal for loaders or `beforeLoad` guards.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param params - Parameters forwarded to `authClient.getSession`.
 */
export const ensureSession = <TAuthClient extends SessionAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.ensureQueryData(sessionOptions(authClient, params))

/**
 * Prefetch the current session into the query cache. Behaves like
 * `fetchSession`, but does not throw on error and does not return the data —
 * use this to warm the cache without blocking navigation.
 *
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param params - Parameters forwarded to `authClient.getSession`.
 */
export const prefetchSession = <TAuthClient extends SessionAuthClient>(
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
 * @param queryClient - The TanStack Query client.
 * @param authClient - The Better Auth client.
 * @param params - Parameters forwarded to `authClient.getSession`.
 */
export const fetchSession = <TAuthClient extends SessionAuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  params?: SessionParams<TAuthClient>
) => queryClient.fetchQuery(sessionOptions(authClient, params))
