import {
  type AdminAuthClient,
  type AdminUserResponse,
  adminUserOptions
} from "@better-auth-ui/core/plugins/admin"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseAdminUserOptions = Accessor<
  Omit<QueryOptions<AdminUserResponse>, "queryKey">
>

/** Subscribe to the user currently selected in an Admin inspector. */
export function useAdminUser(
  authClient: AdminAuthClient,
  targetUserId: Accessor<string | undefined>,
  options?: UseAdminUserOptions,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { initialData, ...queryOptions } = options?.() ?? {}

    return {
      ...adminUserOptions(authClient, session.data?.user.id, targetUserId()),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
