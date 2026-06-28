import {
  type ListDeviceSessionsData,
  type ListDeviceSessionsParams,
  listDeviceSessionsOptions,
  type MultiSessionAuthClient
} from "@better-auth-ui/core/plugins/multi-session"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListDeviceSessionsOptions<
  TAuthClient extends MultiSessionAuthClient
> = Accessor<
  Omit<QueryOptions<ListDeviceSessionsData<TAuthClient>>, "queryKey"> &
    ListDeviceSessionsParams<TAuthClient>
>

export function useListDeviceSessions<
  TAuthClient extends MultiSessionAuthClient
>(
  authClient: TAuthClient,
  options?: UseListDeviceSessionsOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = session.data?.user.id
    const {
      query,
      fetchOptions,
      initialData,
      enabled = true,
      ...queryOptions
    } = options?.() ?? {}
    const baseOptions = listDeviceSessionsOptions(authClient, userId, {
      query,
      fetchOptions
    })

    return {
      ...baseOptions,
      queryFn: baseOptions.queryFn,
      ...queryOptions,
      enabled: Boolean(userId) && enabled,
      initialData: initialData as undefined
    }
  }, queryClient)
}
