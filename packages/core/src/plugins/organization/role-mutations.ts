import type { MutationOptions, QueryKey } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

type RoleMethod = "createRole" | "updateRole" | "deleteRole"
type RoleParams<
  TAuthClient extends OrganizationAuthClient,
  TMethod extends RoleMethod
> = NonNullable<Parameters<TAuthClient["organization"][TMethod]>[0]>

function roleMutationOptions<
  TAuthClient extends OrganizationAuthClient,
  TMethod extends RoleMethod
>(
  authClient: TAuthClient,
  method: TMethod,
  mutationKey: readonly string[],
  userId?: string,
  organizationId?: string
) {
  const mutationFn = async (params: RoleParams<TAuthClient, TMethod>) => {
    const resolvedOrganizationId = params.organizationId ?? organizationId

    if (!resolvedOrganizationId) {
      throw new Error(
        `[Better Auth UI] organizationId is required for ${method}.`
      )
    }

    const input = {
      ...params,
      organizationId: resolvedOrganizationId,
      fetchOptions: { ...params.fetchOptions, throw: true }
    }

    if (method === "deleteRole") {
      const roleSelector = params as DeleteRoleParams<TAuthClient>
      const role = await authClient.organization.getRole({
        query: {
          organizationId: resolvedOrganizationId,
          roleId: roleSelector.roleId,
          roleName: roleSelector.roleName
        },
        fetchOptions: { throw: true }
      })

      if (role) {
        const assignments = await authClient.organization.listMembers({
          query: {
            organizationId: resolvedOrganizationId,
            filterField: "role",
            filterOperator: "contains",
            filterValue: role.role,
            limit: 1
          },
          fetchOptions: { throw: true }
        })

        if (assignments?.members.length) {
          throw new Error(
            `[Better Auth UI] Move members out of the "${role.role}" role before deleting it.`
          )
        }
      }
    }

    const roleMethod = authClient.organization[method] as (
      body: typeof input
    ) => ReturnType<TAuthClient["organization"][TMethod]>

    return await roleMethod(input)
  }

  const relatedQueries: QueryKey[] = [
    organizationQueryKeys.roles.all(userId),
    organizationQueryKeys.members.all(userId),
    organizationQueryKeys.invitations.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ]

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: relatedQueries,
      invalidates: [organizationQueryKeys.permissions.all(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}

export type CreateRoleParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = RoleParams<TAuthClient, "createRole">
export type UpdateRoleParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = RoleParams<TAuthClient, "updateRole">
export type DeleteRoleParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = RoleParams<TAuthClient, "deleteRole">

type PublicMutationOptions<T> = Omit<T, "mutationKey" | "mutationFn" | "meta">

export const createRoleOptions = <T extends OrganizationAuthClient>(
  authClient: T,
  userId?: string,
  organizationId?: string
) =>
  roleMutationOptions(
    authClient,
    "createRole",
    organizationMutationKeys.roles.create,
    userId,
    organizationId
  )

export const updateRoleOptions = <T extends OrganizationAuthClient>(
  authClient: T,
  userId?: string,
  organizationId?: string
) =>
  roleMutationOptions(
    authClient,
    "updateRole",
    organizationMutationKeys.roles.update,
    userId,
    organizationId
  )

export const deleteRoleOptions = <T extends OrganizationAuthClient>(
  authClient: T,
  userId?: string,
  organizationId?: string
) =>
  roleMutationOptions(
    authClient,
    "deleteRole",
    organizationMutationKeys.roles.delete,
    userId,
    organizationId
  )

export type CreateRoleOptions<T extends OrganizationAuthClient> =
  PublicMutationOptions<ReturnType<typeof createRoleOptions<T>>>
export type UpdateRoleOptions<T extends OrganizationAuthClient> =
  PublicMutationOptions<ReturnType<typeof updateRoleOptions<T>>>
export type DeleteRoleOptions<T extends OrganizationAuthClient> =
  PublicMutationOptions<ReturnType<typeof deleteRoleOptions<T>>>
