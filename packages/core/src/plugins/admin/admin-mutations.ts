import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { AdminAuthClient } from "./admin-auth-client"
import { adminMutationKeys } from "./admin-mutation-keys"
import { adminQueryKeys } from "./admin-query-keys"

type CreateUserParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["createUser"]>[0]
>
type UpdateUserParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["updateUser"]>[0]
>
type SetRoleParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["setRole"]>[0]
>
type SetUserPasswordParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["setUserPassword"]>[0]
>
type BanUserParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["banUser"]>[0]
>
type UnbanUserParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["unbanUser"]>[0]
>
type RevokeUserSessionParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["revokeUserSession"]>[0]
>
type RevokeUserSessionsParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["revokeUserSessions"]>[0]
>
type ImpersonateUserParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["impersonateUser"]>[0]
>
type RemoveUserParams = NonNullable<
  Parameters<AdminAuthClient["admin"]["removeUser"]>[0]
>

type AdminMutationOptions<TData, TVariables> = MutationOptions<
  TData,
  BetterFetchError,
  TVariables
>

export function createAdminUserOptions(
  authClient: AdminAuthClient,
  actorUserId?: string
) {
  const mutationFn = (params: CreateUserParams) =>
    authClient.admin.createUser({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.createUser,
    mutationFn,
    meta: { awaits: [adminQueryKeys.users.lists(actorUserId)] }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    CreateUserParams
  >
}

export function updateAdminUserOptions(
  authClient: AdminAuthClient,
  actorUserId?: string
) {
  const mutationFn = (params: UpdateUserParams) =>
    authClient.admin.updateUser({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.updateUser,
    mutationFn,
    meta: {
      awaits: [
        adminQueryKeys.users.lists(actorUserId),
        adminQueryKeys.users.details(actorUserId)
      ]
    }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    UpdateUserParams
  >
}

export function setAdminUserRoleOptions(
  authClient: AdminAuthClient,
  actorUserId?: string
) {
  const mutationFn = (params: SetRoleParams) =>
    authClient.admin.setRole({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.setRole,
    mutationFn,
    meta: {
      awaits: [
        adminQueryKeys.users.lists(actorUserId),
        adminQueryKeys.users.details(actorUserId)
      ]
    }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    SetRoleParams
  >
}

/**
 * Mutation options for setting a password.
 *
 * Keep the password in local form state, never in a query key or mutation
 * metadata, and reset the mutation immediately after the request settles.
 */
export function setAdminUserPasswordOptions(
  authClient: AdminAuthClient,
  onSettled: () => void = () => {}
) {
  const mutationFn = (params: SetUserPasswordParams) =>
    authClient.admin.setUserPassword({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.setUserPassword,
    mutationFn,
    gcTime: 0,
    onSettled
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    SetUserPasswordParams
  >
}

export function banAdminUserOptions(
  authClient: AdminAuthClient,
  actorUserId?: string
) {
  const mutationFn = (params: BanUserParams) =>
    authClient.admin.banUser({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.banUser,
    mutationFn,
    meta: {
      awaits: [
        adminQueryKeys.users.lists(actorUserId),
        adminQueryKeys.users.details(actorUserId)
      ]
    }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BanUserParams
  >
}

export function unbanAdminUserOptions(
  authClient: AdminAuthClient,
  actorUserId?: string
) {
  const mutationFn = (params: UnbanUserParams) =>
    authClient.admin.unbanUser({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.unbanUser,
    mutationFn,
    meta: {
      awaits: [
        adminQueryKeys.users.lists(actorUserId),
        adminQueryKeys.users.details(actorUserId)
      ]
    }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    UnbanUserParams
  >
}

export function revokeAdminUserSessionOptions(
  authClient: AdminAuthClient,
  actorUserId: string | undefined,
  targetUserId: string | undefined
) {
  const mutationFn = (params: RevokeUserSessionParams) =>
    authClient.admin.revokeUserSession({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.revokeUserSession,
    mutationFn,
    meta: {
      awaits: [adminQueryKeys.users.sessions(actorUserId, targetUserId)]
    }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    RevokeUserSessionParams
  >
}

export function revokeAdminUserSessionsOptions(
  authClient: AdminAuthClient,
  actorUserId: string | undefined,
  targetUserId: string | undefined
) {
  const mutationFn = (params: RevokeUserSessionsParams) =>
    authClient.admin.revokeUserSessions({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.revokeUserSessions,
    mutationFn,
    meta: {
      awaits: [adminQueryKeys.users.sessions(actorUserId, targetUserId)]
    }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    RevokeUserSessionsParams
  >
}

export function impersonateAdminUserOptions(
  authClient: AdminAuthClient,
  actorUserId?: string
) {
  const mutationFn = (params: ImpersonateUserParams) =>
    authClient.admin.impersonateUser({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.impersonateUser,
    mutationFn,
    meta: {
      removes: [adminQueryKeys.all(actorUserId)],
      awaits: [authQueryKeys.session]
    }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    ImpersonateUserParams
  >
}

export function removeAdminUserOptions(
  authClient: AdminAuthClient,
  actorUserId?: string
) {
  const mutationFn = (params: RemoveUserParams) =>
    authClient.admin.removeUser({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: adminMutationKeys.removeUser,
    mutationFn,
    meta: {
      awaits: [
        adminQueryKeys.users.lists(actorUserId),
        adminQueryKeys.users.details(actorUserId)
      ]
    }
  } satisfies AdminMutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    RemoveUserParams
  >
}
