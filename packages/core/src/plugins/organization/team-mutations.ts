import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

type TeamMethod =
  | "createTeam"
  | "updateTeam"
  | "removeTeam"
  | "addTeamMember"
  | "removeTeamMember"
type TeamParams<
  T extends OrganizationAuthClient,
  K extends TeamMethod
> = Parameters<T["organization"][K]>[0]

function teamMutationOptions<
  T extends OrganizationAuthClient,
  K extends TeamMethod
>(authClient: T, method: K, mutationKey: readonly string[], userId?: string) {
  const mutationFn = (params: TeamParams<T, K>) =>
    (authClient.organization[method] as (params: TeamParams<T, K>) => unknown)({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })
  return {
    mutationKey,
    mutationFn,
    meta: { awaits: [organizationQueryKeys.teams.all(userId)] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}

export type CreateTeamParams<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = TeamParams<T, "createTeam">
export type UpdateTeamParams<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = TeamParams<T, "updateTeam">
export type RemoveTeamParams<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = TeamParams<T, "removeTeam">
export type AddTeamMemberParams<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = TeamParams<T, "addTeamMember">
export type RemoveTeamMemberParams<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = TeamParams<T, "removeTeamMember">

type PublicTeamMutationOptions<T> = Omit<
  T,
  "mutationKey" | "mutationFn" | "meta"
>

export const createTeamOptions = <T extends OrganizationAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "createTeam",
    organizationMutationKeys.teams.create,
    userId
  )
export const updateTeamOptions = <T extends OrganizationAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "updateTeam",
    organizationMutationKeys.teams.update,
    userId
  )
export const removeTeamOptions = <T extends OrganizationAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "removeTeam",
    organizationMutationKeys.teams.remove,
    userId
  )
export const addTeamMemberOptions = <T extends OrganizationAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "addTeamMember",
    organizationMutationKeys.teams.addMember,
    userId
  )
export const removeTeamMemberOptions = <T extends OrganizationAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "removeTeamMember",
    organizationMutationKeys.teams.removeMember,
    userId
  )

export type CreateTeamOptions<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof createTeamOptions<T>>>
export type UpdateTeamOptions<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof updateTeamOptions<T>>>
export type RemoveTeamOptions<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof removeTeamOptions<T>>>
export type AddTeamMemberOptions<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof addTeamMemberOptions<T>>>
export type RemoveTeamMemberOptions<
  T extends OrganizationAuthClient = OrganizationAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof removeTeamMemberOptions<T>>>
