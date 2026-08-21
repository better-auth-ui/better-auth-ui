import {
  type AdminAuthClient,
  type AdminListUsersParams,
  type AdminUsersResponse,
  adminUsersOptions
} from "@better-auth-ui/core/plugins/admin"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseAdminUsersOptions = Omit<
  UseQueryOptions<AdminUsersResponse>,
  "queryKey"
> & {
  params?: AdminListUsersParams
}

/** Subscribe to an actor-scoped, server-paginated Admin user list. */
export function useAdminUsers(
  authClient: AdminAuthClient,
  options: UseAdminUsersOptions = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { params, ...queryOptions } = options

  return useQuery(
    {
      ...adminUsersOptions(authClient, session?.user.id, params),
      ...queryOptions
    },
    queryClient
  )
}
