import {
  type AccountInfoOptions,
  type AuthClient,
  accountInfoOptions
} from "@better-auth-ui/core"
import { type QueryClient, skipToken, useQuery } from "@tanstack/react-query"
import { useSession } from "./use-session"

type AccountInfoParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["accountInfo"]
>[0]

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

  const canFetch = Boolean(userId && query?.accountId)

  return useQuery(
    {
      ...queryOptions,
      ...baseOptions,
      queryFn: canFetch ? baseOptions.queryFn : skipToken
    },
    queryClient
  )
}
