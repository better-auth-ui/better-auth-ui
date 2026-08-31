import {
  type ListUserTeamsData,
  type ListUserTeamsParams,
  listUserTeamsOptions,
  type OrganizationTeamsAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListUserTeamsOptions<T extends OrganizationTeamsAuthClient> =
  Omit<UseQueryOptions<ListUserTeamsData<T>>, "queryKey"> &
    ListUserTeamsParams<T>

export function useListUserTeams<T extends OrganizationTeamsAuthClient>(
  authClient: T,
  options: UseListUserTeamsOptions<T>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...listUserTeamsOptions(authClient, session?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
