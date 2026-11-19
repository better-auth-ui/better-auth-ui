import {
  type AdminAuthClient,
  type AdminUserResponse,
  adminUserOptions
} from "@better-auth-ui/core/plugins/admin"
import {
  type QueryClient,
  type UseQueryOptions,
  type UseQueryResult,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import type { UserWithRole } from "better-auth/plugins"

export type UseAdminUserOptions = Omit<
  UseQueryOptions<AdminUserResponse>,
  "queryKey"
>

/** Subscribe to the user currently selected in an Admin inspector. */
export function useAdminUser(
  authClient: AdminAuthClient,
  targetUserId?: string,
  options?: UseAdminUserOptions,
  queryClient?: QueryClient
): UseQueryResult<NoInfer<UserWithRole>> {
  const { data: session } = useSession(authClient, undefined, queryClient)

  return useQuery(
    {
      ...adminUserOptions(authClient, session?.user.id, targetUserId),
      ...options
    },
    queryClient
  )
}
