import {
  type ListDeviceSessionsData,
  type ListDeviceSessionsParams,
  listDeviceSessionsOptions,
  type MultiSessionAuthClient
} from "@better-auth-ui/core/plugins/multi-session"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Options for `useListDeviceSessions`, combining React Query options with core query parameters.
 */
export type UseListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
> = Omit<UseQueryOptions<ListDeviceSessionsData<TAuthClient>>, "queryKey"> &
  ListDeviceSessionsParams<TAuthClient>

/**
 * React query hook for device sessions for the current user.
 *
 * @param authClient - The Better Auth client.
 * @param options - Core query parameters and React Query options.
 * @param queryClient - Optional React Query client override.
 */
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

  return useQuery(
    {
      ...listDeviceSessionsOptions(authClient, userId, { query, fetchOptions }),
      ...queryOptions
    },
    queryClient
  )
}
