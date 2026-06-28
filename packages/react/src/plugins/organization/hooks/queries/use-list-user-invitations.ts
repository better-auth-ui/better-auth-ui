import {
  type ListUserInvitationsData,
  type ListUserInvitationsParams,
  listUserInvitationsOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  skipToken,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListUserInvitationsOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<UseQueryOptions<ListUserInvitationsData<TAuthClient>>, "queryKey"> &
  ListUserInvitationsParams<TAuthClient>

export function useListUserInvitations<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options: UseListUserInvitationsOptions<TAuthClient> = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id
  const { query, fetchOptions, ...queryOptions } = options
  const baseOptions = listUserInvitationsOptions(authClient, userId, {
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
