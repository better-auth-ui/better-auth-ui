import {
  type OrganizationRoleData,
  type OrganizationRoleParams,
  type OrganizationRolesAuthClient,
  roleOptions
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery,
  type UseQueryResult
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { passInitialData } from "../../../../lib/query-initial-data"
import type { InferData } from "@better-auth-ui/core"

export type UseRoleOptions<T extends OrganizationRolesAuthClient> = Accessor<
  Omit<QueryOptions<OrganizationRoleData<T>>, "queryKey"> &
    OrganizationRoleParams<T>
>

export function useRole<T extends OrganizationRolesAuthClient>(
  authClient: T,
  options: UseRoleOptions<T>,
  queryClient?: Accessor<QueryClient>
): UseQueryResult<InferData<T["organization"]["getRole"]>> {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } = options()
    return {
      ...roleOptions(authClient, session.data?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions,
      ...passInitialData(initialData)
    }
  }, queryClient)
}
