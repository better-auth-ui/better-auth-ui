import {
  type AdminAuthClient,
  type AdminPermission,
  type AdminPermissionResponse,
  adminPermissionOptions
} from "@better-auth-ui/core/plugins/admin"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseAdminPermissionOptions = Accessor<
  Omit<QueryOptions<AdminPermissionResponse>, "queryKey">
>

/** Check one Admin permission for the acting user. */
export function useAdminPermission(
  authClient: AdminAuthClient,
  permission: Accessor<AdminPermission>,
  options?: UseAdminPermissionOptions,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { initialData, ...queryOptions } = options?.() ?? {}

    return {
      ...adminPermissionOptions(
        authClient,
        session.data?.user.id,
        permission()
      ),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
