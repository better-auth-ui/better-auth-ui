import {
  type QueryClient,
  type QueryOptions,
  skipToken
} from "@tanstack/query-core"
import type { InferData } from "../../lib/auth-client"
import type { AdminAuthClient } from "./admin-auth-client"
import { adminQueryKeys } from "./admin-query-keys"

type AdminResultError = {
  code?: string
  message?: string
  status: number
  statusText: string
}

/** Error returned by a Better Auth Admin client request. */
export class AdminClientError extends Error {
  readonly code?: string
  readonly status: number
  readonly statusText: string

  constructor(error: AdminResultError) {
    super(error.message || error.statusText || "Admin request failed")
    this.name = "AdminClientError"
    this.code = error.code
    this.status = error.status
    this.statusText = error.statusText
  }
}

type ListUsersInput = NonNullable<
  Parameters<AdminAuthClient["admin"]["listUsers"]>[0]
>

export type AdminListUsersParams = NonNullable<ListUsersInput["query"]>
export type AdminUsersResponse = NonNullable<
  InferData<AdminAuthClient["admin"]["listUsers"]>
>
export type AdminUser = AdminUsersResponse["users"][number]
export type AdminUserResponse = NonNullable<
  InferData<AdminAuthClient["admin"]["getUser"]>
>
export type AdminUserSessionsResponse = NonNullable<
  InferData<AdminAuthClient["admin"]["listUserSessions"]>
>
export type AdminUserSession = AdminUserSessionsResponse["sessions"][number]
export type AdminPermission = Readonly<Record<string, readonly string[]>>
export type AdminPermissionResponse = NonNullable<
  InferData<AdminAuthClient["admin"]["hasPermission"]>
>

const unwrapAdminResult = <TData>(
  result: { data: TData; error: null } | { data: null; error: AdminResultError }
) => {
  if (result.error) throw new AdminClientError(result.error)
  return result.data
}

/** Query options for the Admin user list. */
export function adminUsersOptions(
  authClient: AdminAuthClient,
  actorUserId?: string,
  params: AdminListUsersParams = {}
) {
  return {
    queryKey: adminQueryKeys.users.list(actorUserId, params),
    queryFn: actorUserId
      ? async ({ signal }) =>
          unwrapAdminResult(
            await authClient.admin.listUsers({
              query: params,
              fetchOptions: { signal }
            })
          )
      : skipToken
  } satisfies QueryOptions<AdminUsersResponse>
}

/** Query options for one user selected in the Admin inspector. */
export function adminUserOptions(
  authClient: AdminAuthClient,
  actorUserId?: string,
  targetUserId?: string
) {
  return {
    queryKey: adminQueryKeys.users.detail(actorUserId, targetUserId),
    queryFn:
      actorUserId && targetUserId
        ? async ({ signal }) =>
            unwrapAdminResult(
              await authClient.admin.getUser({
                query: { id: targetUserId },
                fetchOptions: { signal }
              })
            )
        : skipToken
  } satisfies QueryOptions<AdminUserResponse>
}

/** Query options for sessions belonging to one selected user. */
export function adminUserSessionsOptions(
  authClient: AdminAuthClient,
  actorUserId?: string,
  targetUserId?: string
) {
  return {
    queryKey: adminQueryKeys.users.sessions(actorUserId, targetUserId),
    queryFn:
      actorUserId && targetUserId
        ? async ({ signal }) =>
            unwrapAdminResult(
              await authClient.admin.listUserSessions({
                userId: targetUserId,
                fetchOptions: { signal }
              })
            )
        : skipToken
  } satisfies QueryOptions<AdminUserSessionsResponse>
}

/** Query options for one permission held by the acting user. */
export function adminPermissionOptions(
  authClient: AdminAuthClient,
  actorUserId: string | undefined,
  permission: AdminPermission
) {
  return {
    queryKey: adminQueryKeys.permissions.has(actorUserId, permission),
    queryFn: actorUserId
      ? async ({ signal }) =>
          unwrapAdminResult(
            await authClient.admin.hasPermission({
              permissions: permission as Record<string, string[]>,
              fetchOptions: { signal }
            })
          )
      : skipToken
  } satisfies QueryOptions<AdminPermissionResponse>
}

export const ensureAdminUsers = (
  queryClient: QueryClient,
  authClient: AdminAuthClient,
  actorUserId: string,
  params?: AdminListUsersParams
) =>
  queryClient.ensureQueryData(
    adminUsersOptions(authClient, actorUserId, params)
  )

export const fetchAdminUser = (
  queryClient: QueryClient,
  authClient: AdminAuthClient,
  actorUserId: string,
  targetUserId: string
) =>
  queryClient.fetchQuery(
    adminUserOptions(authClient, actorUserId, targetUserId)
  )
