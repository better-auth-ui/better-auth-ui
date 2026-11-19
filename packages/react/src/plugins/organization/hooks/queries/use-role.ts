import {
  type OrganizationRoleData,
  type OrganizationRoleParams,
  type OrganizationRolesAuthClient,
  roleOptions
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  type UseQueryResult,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import type { InferData } from "@better-auth-ui/core"

export type UseRoleOptions<T extends OrganizationRolesAuthClient> = Omit<
  UseQueryOptions<OrganizationRoleData<T>>,
  "queryKey"
> &
  OrganizationRoleParams<T>

export function useRole<T extends OrganizationRolesAuthClient>(
  authClient: T,
  options: UseRoleOptions<T>,
  queryClient?: QueryClient
): UseQueryResult<NoInfer<InferData<T["organization"]["getRole"]>>> {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { query, fetchOptions, ...queryOptions } = options

  return useQuery(
    {
      ...roleOptions(authClient, session?.user.id, { query, fetchOptions }),
      ...queryOptions
    },
    queryClient
  )
}
