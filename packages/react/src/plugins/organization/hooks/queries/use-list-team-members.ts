import {
  type ListTeamMembersData,
  type ListTeamMembersParams,
  listTeamMembersOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListTeamMembersOptions<T extends OrganizationAuthClient> = Omit<
  UseQueryOptions<ListTeamMembersData<T>>,
  "queryKey"
> &
  ListTeamMembersParams<T>
export function useListTeamMembers<T extends OrganizationAuthClient>(
  authClient: T,
  options: UseListTeamMembersOptions<T>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { query, fetchOptions, ...queryOptions } = options
  return useQuery(
    {
      ...listTeamMembersOptions(authClient, session?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
