import {
  type AuthClient,
  type ListSessionsOptions,
  type ListSessionsParams,
  listSessionsOptions
} from "@better-auth-ui/core"
import { type QueryClient, useQuery } from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

/**
 * Get the current user's active sessions from the query cache.
 */
export const ensureListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listSessionsOptions(authClient, userId, params))

/**
 * Prefetch the current user's active sessions into the query cache.
 */
export const prefetchListSessions = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListSessionsParams<TAuthClient>
) => queryClient.prefetchQuery(listSessionsOptions(authClient, userId, params))

/**
 * Fetch and cache the current user's active sessions.
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
      ...baseOptions
    },
    queryClient
  )
}
