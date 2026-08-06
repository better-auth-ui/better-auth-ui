import type { DataTag, QueryClient, QueryOptions } from "@tanstack/query-core"
import type { APIError } from "better-auth"

import { authQueryKeys } from "../../../lib/auth-query-keys"
import type { AuthServer } from "../../../lib/auth-server"

export type SessionData<TAuth extends AuthServer = AuthServer> = Awaited<
  ReturnType<TAuth["api"]["getSession"]>
>

export type Session<TAuth extends AuthServer = AuthServer> = NonNullable<
  SessionData<TAuth>
>

export type SessionParams<TAuth extends AuthServer> = Parameters<
  TAuth["api"]["getSession"]
>[0]

/**
 * Query options factory for the current session on the server.
 *
 * Uses the same query key as the client-side `sessionOptions` so that data
 * fetched during SSR hydrates seamlessly into the client's React Query cache.
 *
 * @param auth - The Better Auth server instance.
 * @param params - Parameters forwarded to `auth.api.getSession` (typically
 *   includes request `headers` for cookie-based session resolution).
 */
export function sessionOptionsServer<TAuth extends AuthServer>(
  auth: TAuth,
  params: SessionParams<TAuth>
) {
  type TData = SessionData<TAuth>
  const queryKey = authQueryKeys.session

  const options = {
    queryKey,
    queryFn: () => auth.api.getSession(params) as Promise<TData>
  } as QueryOptions<TData, APIError, TData, typeof queryKey>

  return options as typeof options & {
    queryKey: DataTag<typeof queryKey, TData, APIError>
  }
}

/**
 * Get the current session from the query cache, calling `fetchSessionServer`
 * under the hood if no cached entry exists. Resolves with the session data,
 * making it suitable for reading the value directly in a server component.
 *
 * @param queryClient - The TanStack Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param params - Parameters forwarded to `auth.api.getSession`.
 */
export const ensureSessionServer = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.ensureQueryData(sessionOptionsServer(auth, params))

/**
 * Prefetch the current session into the query cache. Behaves like
 * `fetchSessionServer`, but does not throw on error and does not return the
 * data — use this when you only need the value to be available after
 * hydration.
 *
 * @param queryClient - The TanStack Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param params - Parameters forwarded to `auth.api.getSession`.
 */
export const prefetchSessionServer = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.prefetchQuery(sessionOptionsServer(auth, params))

/**
 * Fetch and cache the current session, resolving with the data or throwing
 * on error. If a cached entry exists and is neither invalidated nor older
 * than `staleTime`, the cached value is returned without a network call;
 * otherwise the latest data is fetched.
 *
 * @param queryClient - The TanStack Query client used for SSR hydration.
 * @param auth - The Better Auth server instance.
 * @param params - Parameters forwarded to `auth.api.getSession`.
 */
export const fetchSessionServer = <TAuth extends AuthServer>(
  queryClient: QueryClient,
  auth: TAuth,
  params: SessionParams<TAuth>
) => queryClient.fetchQuery(sessionOptionsServer(auth, params))
