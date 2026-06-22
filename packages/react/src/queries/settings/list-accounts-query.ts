import {
  type AuthClient,
  type ListAccountsOptions,
  type ListAccountsParams,
  listAccountsOptions
} from "@better-auth-ui/core"
import { type QueryClient, skipToken, useQuery } from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

export type { ListAccountsParams } from "@better-auth-ui/core"

/**
 * Get the current user's linked social accounts from the query cache.
 */
export const ensureListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) =>
  queryClient.ensureQueryData(listAccountsOptions(authClient, userId, params))

/**
 * Prefetch the current user's linked social accounts into the query cache.
 */
export const prefetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) => queryClient.prefetchQuery(listAccountsOptions(authClient, userId, params))

/**
 * Fetch and cache the current user's linked social accounts.
 */
export const fetchListAccounts = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: ListAccountsParams<TAuthClient>
) => queryClient.fetchQuery(listAccountsOptions(authClient, userId, params))

export type UseListAccountsOptions<TAuthClient extends AuthClient> =
  ListAccountsOptions<TAuthClient> & ListAccountsParams<TAuthClient>

/**
 * Subscribe to the current user's linked social accounts via TanStack Query.
 */
export function useListAccounts<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseListAccountsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = listAccountsOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...queryOptions,
      ...baseOptions,
      queryFn: userId ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
