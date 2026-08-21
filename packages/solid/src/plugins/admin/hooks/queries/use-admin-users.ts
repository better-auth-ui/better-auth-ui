import {
  type AdminAuthClient,
  type AdminListUsersParams,
  type AdminUsersResponse,
  adminUsersOptions
} from "@better-auth-ui/core/plugins/admin"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseAdminUsersOptions = Accessor<
  Omit<QueryOptions<AdminUsersResponse>, "queryKey"> & {
    params?: AdminListUsersParams
  }
>

/** Subscribe to an actor-scoped, server-paginated Admin user list. */
export function useAdminUsers(
  authClient: AdminAuthClient,
  options?: UseAdminUsersOptions,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { params, initialData, ...queryOptions } = options?.() ?? {}

    return {
      ...adminUsersOptions(authClient, session.data?.user.id, params),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
