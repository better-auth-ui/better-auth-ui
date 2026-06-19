import {
  type AuthClient,
  type SessionData,
  type SessionOptions,
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

export type UseSessionOptions<TAuthClient extends AuthClient> = Omit<
  UseQueryOptions<
    SessionData<TAuthClient>,
    BetterFetchError,
    SessionData<TAuthClient>
  >,
  "queryKey" | "queryFn"
> &
  SessionOptions<TAuthClient> &
  SessionParams<TAuthClient>

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
