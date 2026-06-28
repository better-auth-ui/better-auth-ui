import {
  type ListDeviceSessionsData,
  type ListDeviceSessionsParams,
  listDeviceSessionsOptions,
  type MultiSessionAuthClient
} from "@better-auth-ui/core/plugins/multi-session"
import {
  type QueryClient,
  skipToken,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
> = Omit<UseQueryOptions<ListDeviceSessionsData<TAuthClient>>, "queryKey"> &
  ListDeviceSessionsParams<TAuthClient>

export function useListDeviceSessions<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  options: UseListDeviceSessionsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { query, fetchOptions, ...queryOptions } = options
  const baseOptions = listDeviceSessionsOptions(authClient, userId, {
    query,
    fetchOptions
  })

  return useQuery(
    {
      ...baseOptions,

      queryFn: userId ? baseOptions.queryFn : skipToken,

      ...queryOptions
    },
    queryClient
  )
}
