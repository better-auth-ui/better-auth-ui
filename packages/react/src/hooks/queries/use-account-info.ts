import {
  type AccountInfoData,
  type AccountInfoParams,
  type AuthClient,
  accountInfoOptions
} from "@better-auth-ui/core"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "./use-session"

export type UseAccountInfoOptions<TAuthClient extends AuthClient> = Omit<
  UseQueryOptions<AccountInfoData<TAuthClient>>,
  "queryKey"
> &
  AccountInfoParams<TAuthClient>

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

  return useQuery(
    {
      ...accountInfoOptions(authClient, userId, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
