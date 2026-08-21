import { authQueryKeys } from "../../lib/auth-query-keys"

/** Query key factory for Dash audit log queries, partitioned by user. */
export const dashQueryKeys = {
  all: (userId: string | undefined) =>
    [...authQueryKeys.user(userId), "dash"] as const,

  auditLogs: <TParams>(userId: string | undefined, params: TParams) =>
    [...dashQueryKeys.all(userId), "audit-logs", params] as const,

  allAuditLogs: <TParams>(userId: string | undefined, params: TParams) =>
    [...dashQueryKeys.all(userId), "all-audit-logs", params] as const,

  userAuditLogs: <TParams>(
    actorUserId: string | undefined,
    userId: string | undefined,
    params: TParams
  ) =>
    [
      ...dashQueryKeys.all(actorUserId),
      "user-audit-logs",
      userId,
      params
    ] as const
} as const
