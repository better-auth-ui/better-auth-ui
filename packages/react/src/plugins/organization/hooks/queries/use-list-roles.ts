import {
  type ListRolesData,
  type ListRolesParams,
  listRolesOptions,
  type OrganizationRolesAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListRolesOptions<T extends OrganizationRolesAuthClient> = Omit<
  UseQueryOptions<ListRolesData<T>>,
  "queryKey"
> &
  ListRolesParams<T>

export function useListRoles<T extends OrganizationRolesAuthClient>(
  authClient: T,
  options: UseListRolesOptions<T>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...listRolesOptions(authClient, session?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
