import {
  type AccountInfoOptions,
  type AccountInfoParams,
  type AuthClient,
  accountInfoOptions
} from "@better-auth-ui/core"
import { type QueryClient, useQuery } from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

/**
 * Get the current user's provider-specific account info from the query cache.
 */
export const ensureAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) => queryClient.ensureQueryData(accountInfoOptions(authClient, userId, params))

/**
 * Prefetch the current user's provider-specific account info into the query cache.
 */
export const prefetchAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) => queryClient.prefetchQuery(accountInfoOptions(authClient, userId, params))

/**
 * Fetch and cache the current user's provider-specific account info.
 */
export const fetchAccountInfo = <TAuthClient extends AuthClient>(
  queryClient: QueryClient,
  authClient: TAuthClient,
  userId: string,
  params?: AccountInfoParams<TAuthClient>
) => queryClient.fetchQuery(accountInfoOptions(authClient, userId, params))

export type UseAccountInfoOptions<TAuthClient extends AuthClient> =
  AccountInfoOptions<TAuthClient> & AccountInfoParams<TAuthClient>

/**
 * Subscribe to provider-specific info for a linked account via TanStack Query.
 */
export function useAccountInfo<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options: UseAccountInfoOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options

  const baseOptions = accountInfoOptions(authClient, userId, {
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
