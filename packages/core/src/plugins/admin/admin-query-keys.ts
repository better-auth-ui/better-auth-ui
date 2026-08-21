import { authQueryKeys } from "../../lib/auth-query-keys"

/** Query keys for Admin data, partitioned by the acting user. */
export const adminQueryKeys = {
  all: (actorUserId?: string) =>
    [...authQueryKeys.user(actorUserId), "admin"] as const,

  users: {
    all: (actorUserId?: string) =>
      [...adminQueryKeys.all(actorUserId), "users"] as const,
    lists: (actorUserId?: string) =>
      [...adminQueryKeys.users.all(actorUserId), "list"] as const,
    list: <TParams>(actorUserId: string | undefined, params: TParams) =>
      [...adminQueryKeys.users.lists(actorUserId), params] as const,
    details: (actorUserId?: string) =>
      [...adminQueryKeys.users.all(actorUserId), "detail"] as const,
    detail: (actorUserId: string | undefined, targetUserId?: string) =>
      [
        ...adminQueryKeys.users.details(actorUserId),
        targetUserId ?? null
      ] as const,
    sessions: (actorUserId: string | undefined, targetUserId?: string) =>
      [
        ...adminQueryKeys.users.detail(actorUserId, targetUserId),
        "sessions"
      ] as const
  },

  permissions: {
    all: (actorUserId?: string) =>
      [...adminQueryKeys.all(actorUserId), "permissions"] as const,
    has: <TPermission>(
      actorUserId: string | undefined,
      permission: TPermission
    ) => [...adminQueryKeys.permissions.all(actorUserId), permission] as const
  }
} as const
