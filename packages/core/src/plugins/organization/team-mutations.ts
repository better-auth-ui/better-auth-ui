import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationTeamsAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

type TeamMethod =
  | "createTeam"
  | "updateTeam"
  | "removeTeam"
  | "addTeamMember"
  | "removeTeamMember"
type TeamParams<
  T extends OrganizationTeamsAuthClient,
  K extends TeamMethod
> = Parameters<T["organization"][K]>[0]

function teamMutationOptions<
  T extends OrganizationTeamsAuthClient,
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
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = TeamParams<T, "createTeam">
export type UpdateTeamParams<
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = TeamParams<T, "updateTeam">
export type RemoveTeamParams<
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = TeamParams<T, "removeTeam">
export type AddTeamMemberParams<
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = TeamParams<T, "addTeamMember">
export type RemoveTeamMemberParams<
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = TeamParams<T, "removeTeamMember">

type PublicTeamMutationOptions<T> = Omit<
  T,
  "mutationKey" | "mutationFn" | "meta"
>

export const createTeamOptions = <T extends OrganizationTeamsAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "createTeam",
    organizationMutationKeys.teams.create,
    userId
  )
export const updateTeamOptions = <T extends OrganizationTeamsAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "updateTeam",
    organizationMutationKeys.teams.update,
    userId
  )
export const removeTeamOptions = <T extends OrganizationTeamsAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "removeTeam",
    organizationMutationKeys.teams.remove,
    userId
  )
export const addTeamMemberOptions = <T extends OrganizationTeamsAuthClient>(
  authClient: T,
  userId?: string
) =>
  teamMutationOptions(
    authClient,
    "addTeamMember",
    organizationMutationKeys.teams.addMember,
    userId
  )
export const removeTeamMemberOptions = <T extends OrganizationTeamsAuthClient>(
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
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof createTeamOptions<T>>>
export type UpdateTeamOptions<
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof updateTeamOptions<T>>>
export type RemoveTeamOptions<
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof removeTeamOptions<T>>>
export type AddTeamMemberOptions<
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof addTeamMemberOptions<T>>>
export type RemoveTeamMemberOptions<
  T extends OrganizationTeamsAuthClient = OrganizationTeamsAuthClient
> = PublicTeamMutationOptions<ReturnType<typeof removeTeamMemberOptions<T>>>
