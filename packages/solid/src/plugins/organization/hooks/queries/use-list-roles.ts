import {
  type ListRolesData,
  type ListRolesParams,
  listRolesOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListRolesOptions<T extends OrganizationAuthClient> = Accessor<
  Omit<QueryOptions<ListRolesData<T>>, "queryKey"> & ListRolesParams<T>
>

export function useListRoles<T extends OrganizationAuthClient>(
  authClient: T,
  options: UseListRolesOptions<T>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } = options()
    return {
      ...listRolesOptions(authClient, session.data?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
