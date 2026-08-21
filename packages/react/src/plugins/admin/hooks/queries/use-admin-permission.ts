import {
  type AdminAuthClient,
  type AdminPermission,
  type AdminPermissionResponse,
  adminPermissionOptions
} from "@better-auth-ui/core/plugins/admin"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseAdminPermissionOptions = Omit<
  UseQueryOptions<AdminPermissionResponse>,
  "queryKey"
>

/** Check one Admin permission for the acting user. */
export function useAdminPermission(
  authClient: AdminAuthClient,
  permission: AdminPermission,
  options?: UseAdminPermissionOptions,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)

  return useQuery(
    {
      ...adminPermissionOptions(authClient, session?.user.id, permission),
      ...options
    },
    queryClient
  )
}
