import {
  type AdminAuthClient,
  type AdminUserSessionsResponse,
  adminUserSessionsOptions
} from "@better-auth-ui/core/plugins/admin"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseAdminUserSessionsOptions = Omit<
  UseQueryOptions<AdminUserSessionsResponse>,
  "queryKey"
>

/** Subscribe to sessions for the user selected in an Admin inspector. */
export function useAdminUserSessions(
  authClient: AdminAuthClient,
  targetUserId?: string,
  options?: UseAdminUserSessionsOptions,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)

  return useQuery(
    {
      ...adminUserSessionsOptions(authClient, session?.user.id, targetUserId),
      ...options
    },
    queryClient
  )
}
