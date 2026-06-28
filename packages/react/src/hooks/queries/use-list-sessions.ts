import {
  type AuthClient,
  type ListSessionsData,
  type ListSessionsParams,
  listSessionsOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "./use-session"

export type UseListSessionsOptions<TAuthClient extends AuthClient> = Partial<
  UseQueryOptions<ListSessionsData<TAuthClient>>
> &
  ListSessionsParams<TAuthClient>

/**
 * Subscribe to the current user's active sessions via TanStack Query.
 */
export function useListSessions<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListSessionsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...listSessionsOptions(authClient, session?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
