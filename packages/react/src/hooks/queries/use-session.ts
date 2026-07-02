import {
  type AuthClient,
  type SessionData,
  type SessionParams,
  sessionOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"

export type UseSessionOptions<TAuthClient extends AuthClient> = Partial<
  UseQueryOptions<SessionData<TAuthClient>>
> &
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
