import {
  type ListTeamsData,
  type ListTeamsParams,
  listTeamsOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListTeamsOptions<T extends OrganizationAuthClient> = Omit<
  UseQueryOptions<ListTeamsData<T>>,
  "queryKey"
> &
  ListTeamsParams<T>
export function useListTeams<T extends OrganizationAuthClient>(
  authClient: T,
  options: UseListTeamsOptions<T>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { query, fetchOptions, ...queryOptions } = options
  return useQuery(
    {
      ...listTeamsOptions(authClient, session?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
