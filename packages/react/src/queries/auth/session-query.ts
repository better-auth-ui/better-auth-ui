import {
  ensureSession,
  fetchSession,
  prefetchSession,
  type Session,
  type SessionAuthClient,
  type SessionData,
  type SessionParams,
  sessionOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type UseQueryOptions,
  type UseQueryResult,
  useQuery
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

export type { Session, SessionAuthClient, SessionData, SessionParams }
export { ensureSession, fetchSession, prefetchSession, sessionOptions }

export type UseSessionOptions<TAuthClient extends SessionAuthClient> = Omit<
  UseQueryOptions<
    SessionData<TAuthClient>,
    BetterFetchError,
    SessionData<TAuthClient>
  >,
  "queryKey" | "queryFn"
> &
  SessionParams<TAuthClient>

/**
 * Subscribe to the current session via TanStack Query.
 *
 * Core owns the framework-agnostic options factory. React keeps only the
 * framework-specific `useQuery` boundary.
 *
 * @param authClient - The Better Auth client.
 * @param options - `getSession` params (`query`, `fetchOptions`) merged
 *   with `useQuery` options (e.g. `enabled`, `staleTime`, `select`).
 * @param queryClient - Optional custom `QueryClient`. Defaults to the client
 *   from the nearest `QueryClientProvider`.
 */
export function useSession<TAuthClient extends SessionAuthClient>(
  authClient: TAuthClient,
  options: UseSessionOptions<TAuthClient> = {},
  queryClient?: QueryClient
): UseQueryResult<SessionData<TAuthClient>, BetterFetchError> {
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...sessionOptions(authClient, { query, fetchOptions }),
      ...queryOptions
    } as never,
    queryClient
  ) as UseQueryResult<SessionData<TAuthClient>, BetterFetchError>
}
