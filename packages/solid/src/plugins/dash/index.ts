import {
  type DashAllAuditLogsParams,
  type DashAuditLogsParams,
  type DashAuditLogsResponse,
  type DashAuthClient,
  dashAllAuditLogsOptions,
  dashAuditLogsOptions
} from "@better-auth-ui/core/plugins/dash"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../hooks/queries/use-session"

type DashQueryOptions = Omit<QueryOptions<DashAuditLogsResponse>, "queryKey">

export type UseDashAuditLogsOptions = Accessor<
  DashQueryOptions & { params?: DashAuditLogsParams }
>

export type UseDashAllAuditLogsOptions = Accessor<
  DashQueryOptions & { params?: DashAllAuditLogsParams }
>

/** Load audit logs for the signed-in user. */
export function useDashAuditLogs(
  authClient: DashAuthClient,
  options?: UseDashAuditLogsOptions,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { params, initialData, ...queryOptions } = options?.() ?? {}
    return {
      ...dashAuditLogsOptions(authClient, session.data?.user.id, params),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}

/** Load organization-wide audit logs available to owners and admins. */
export function useDashAllAuditLogs(
  authClient: DashAuthClient,
  options?: UseDashAllAuditLogsOptions,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { params, initialData, ...queryOptions } = options?.() ?? {}
    return {
      ...dashAllAuditLogsOptions(authClient, session.data?.user.id, params),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
