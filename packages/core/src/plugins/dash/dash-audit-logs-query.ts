import type {
  DashAuditLogsResponse,
  DashGetAllAuditLogsInput,
  DashGetAuditLogsInput
} from "@better-auth/infra/client"
import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { DashAuthClient } from "./dash-auth-client"
import { dashQueryKeys } from "./dash-query-keys"

type DashResultError = {
  message?: string
  status: number
  statusText: string
}

/** Error returned by the Infrastructure Dash client. */
export class DashClientError extends Error {
  readonly status: number
  readonly statusText: string

  constructor(error: DashResultError) {
    super(error.message || error.statusText || "Dash request failed")
    this.name = "DashClientError"
    this.status = error.status
    this.statusText = error.statusText
  }
}

export type DashAuditLogsParams = Omit<
  DashGetAuditLogsInput,
  "session" | "user" | "userId"
>

export type DashAllAuditLogsParams = Omit<
  DashGetAllAuditLogsInput,
  "session" | "userId"
>

export type DashUserAuditLogsParams = Omit<
  DashGetAllAuditLogsInput,
  "organizationId" | "session" | "userId"
>

const unwrapDashResult = (
  result:
    | { data: DashAuditLogsResponse; error: null }
    | { data: null; error: DashResultError }
) => {
  if (result.error) throw new DashClientError(result.error)
  return result.data
}

/** Query options for the signed-in user's audit logs. */
export function dashAuditLogsOptions(
  authClient: DashAuthClient,
  userId?: string,
  params: DashAuditLogsParams = {}
) {
  return {
    queryKey: dashQueryKeys.auditLogs(userId, params),
    queryFn: userId
      ? async () =>
          unwrapDashResult(
            await authClient.dash.getAuditLogs({ ...params, userId })
          )
      : skipToken
  } satisfies QueryOptions<DashAuditLogsResponse>
}

/** Query options for organization-wide audit logs available to owners/admins. */
export function dashAllAuditLogsOptions(
  authClient: DashAuthClient,
  userId?: string,
  params: DashAllAuditLogsParams = {}
) {
  return {
    queryKey: dashQueryKeys.allAuditLogs(userId, params),
    queryFn: userId
      ? async () =>
          unwrapDashResult(await authClient.dash.getAllAuditLogs(params))
      : skipToken
  } satisfies QueryOptions<DashAuditLogsResponse>
}

/** Query options for one user's audit logs available to owners/admins. */
export function dashUserAuditLogsOptions(
  authClient: DashAuthClient,
  actorUserId?: string,
  userId?: string,
  params: DashUserAuditLogsParams = {}
) {
  return {
    queryKey: dashQueryKeys.userAuditLogs(actorUserId, userId, params),
    queryFn:
      actorUserId && userId
        ? async () =>
            unwrapDashResult(
              await authClient.dash.getAllAuditLogs({ ...params, userId })
            )
        : skipToken
  } satisfies QueryOptions<DashAuditLogsResponse>
}

export const ensureDashAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  userId: string,
  params?: DashAuditLogsParams
) =>
  queryClient.ensureQueryData(dashAuditLogsOptions(authClient, userId, params))

export const prefetchDashAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  userId: string,
  params?: DashAuditLogsParams
) => queryClient.prefetchQuery(dashAuditLogsOptions(authClient, userId, params))

export const fetchDashAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  userId: string,
  params?: DashAuditLogsParams
) => queryClient.fetchQuery(dashAuditLogsOptions(authClient, userId, params))

export const ensureDashAllAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  userId: string,
  params?: DashAllAuditLogsParams
) =>
  queryClient.ensureQueryData(
    dashAllAuditLogsOptions(authClient, userId, params)
  )

export const prefetchDashAllAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  userId: string,
  params?: DashAllAuditLogsParams
) =>
  queryClient.prefetchQuery(dashAllAuditLogsOptions(authClient, userId, params))

export const fetchDashAllAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  userId: string,
  params?: DashAllAuditLogsParams
) => queryClient.fetchQuery(dashAllAuditLogsOptions(authClient, userId, params))

export const ensureDashUserAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  actorUserId: string,
  userId: string,
  params?: DashUserAuditLogsParams
) =>
  queryClient.ensureQueryData(
    dashUserAuditLogsOptions(authClient, actorUserId, userId, params)
  )

export const prefetchDashUserAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  actorUserId: string,
  userId: string,
  params?: DashUserAuditLogsParams
) =>
  queryClient.prefetchQuery(
    dashUserAuditLogsOptions(authClient, actorUserId, userId, params)
  )

export const fetchDashUserAuditLogs = (
  queryClient: QueryClient,
  authClient: DashAuthClient,
  actorUserId: string,
  userId: string,
  params?: DashUserAuditLogsParams
) =>
  queryClient.fetchQuery(
    dashUserAuditLogsOptions(authClient, actorUserId, userId, params)
  )
