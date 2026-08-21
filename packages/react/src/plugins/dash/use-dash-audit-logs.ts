import {
  type DashAllAuditLogsParams,
  type DashAuditLogsParams,
  type DashAuditLogsResponse,
  type DashAuthClient,
  type DashUserAuditLogsParams,
  dashAllAuditLogsOptions,
  dashAuditLogsOptions,
  dashUserAuditLogsOptions
} from "@better-auth-ui/core/plugins/dash"
import {
  type QueryClient,
  type UseQueryOptions,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../hooks/queries/use-session"

type DashQueryOptions = Omit<UseQueryOptions<DashAuditLogsResponse>, "queryKey">

export type UseDashAuditLogsOptions = DashQueryOptions & {
  params?: DashAuditLogsParams
}

export type UseDashAllAuditLogsOptions = DashQueryOptions & {
  params?: DashAllAuditLogsParams
}

export type UseDashUserAuditLogsOptions = DashQueryOptions & {
  params?: DashUserAuditLogsParams
}

/** Load audit logs for the signed-in user. */
export function useDashAuditLogs(
  authClient: DashAuthClient,
  options: UseDashAuditLogsOptions = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { params, ...queryOptions } = options

  return useQuery(
    {
      ...dashAuditLogsOptions(authClient, session?.user.id, params),
      ...queryOptions
    },
    queryClient
  )
}

/** Load organization-wide audit logs available to owners and admins. */
export function useDashAllAuditLogs(
  authClient: DashAuthClient,
  options: UseDashAllAuditLogsOptions = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { params, ...queryOptions } = options

  return useQuery(
    {
      ...dashAllAuditLogsOptions(authClient, session?.user.id, params),
      ...queryOptions
    },
    queryClient
  )
}

/** Load one user's audit logs available to organization owners/admins. */
export function useDashUserAuditLogs(
  authClient: DashAuthClient,
  userId: string | undefined,
  options: UseDashUserAuditLogsOptions = {},
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { params, ...queryOptions } = options

  return useQuery(
    {
      ...dashUserAuditLogsOptions(authClient, session?.user.id, userId, params),
      ...queryOptions
    },
    queryClient
  )
}
