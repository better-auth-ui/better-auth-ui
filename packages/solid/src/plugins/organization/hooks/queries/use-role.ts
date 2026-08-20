import {
  type OrganizationAuthClient,
  type OrganizationRoleData,
  type OrganizationRoleParams,
  roleOptions
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseRoleOptions<T extends OrganizationAuthClient> = Accessor<
  Omit<QueryOptions<OrganizationRoleData<T>>, "queryKey"> &
    OrganizationRoleParams<T>
>

export function useRole<T extends OrganizationAuthClient>(
  authClient: T,
  options: UseRoleOptions<T>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } = options()
    return {
      ...roleOptions(authClient, session.data?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
