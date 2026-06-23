import {
  type AuthClient,
  type ListAccountsOptions,
  listAccountsOptions
} from "@better-auth-ui/core"
import { type QueryClient, skipToken, useQuery } from "@tanstack/react-query"
import { useSession } from "./use-session"

type ListAccountsParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["listAccounts"]
>[0]

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
