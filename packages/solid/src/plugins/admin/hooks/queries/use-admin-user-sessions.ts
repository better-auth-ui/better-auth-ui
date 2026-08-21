import {
  type AdminAuthClient,
  type AdminUserSessionsResponse,
  adminUserSessionsOptions
} from "@better-auth-ui/core/plugins/admin"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseAdminUserSessionsOptions = Accessor<
  Omit<QueryOptions<AdminUserSessionsResponse>, "queryKey">
>

/** Subscribe to sessions for the user selected in an Admin inspector. */
export function useAdminUserSessions(
  authClient: AdminAuthClient,
  targetUserId: Accessor<string | undefined>,
  options?: UseAdminUserSessionsOptions,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { initialData, ...queryOptions } = options?.() ?? {}

    return {
      ...adminUserSessionsOptions(
        authClient,
        session.data?.user.id,
        targetUserId()
      ),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
