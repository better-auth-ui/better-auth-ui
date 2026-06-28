import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type UpdateMemberRoleFn<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = TAuthClient["organization"]["updateMemberRole"]

export type UpdateMemberRoleParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<UpdateMemberRoleFn<TAuthClient>>[0]

export type UpdateMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof updateMemberRoleOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const memberRoleMeta = (userId: string | undefined) => ({
  awaits: [
    organizationQueryKeys.members.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ],
  invalidates: [organizationQueryKeys.permissions.all(userId)]
})

export function updateMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string, organizationId?: string) {
  const mutationKey = organizationMutationKeys.updateMemberRole

  const mutationFn = (params: UpdateMemberRoleParams<TAuthClient>) => {
    const input = params as UpdateMemberRoleParams<TAuthClient> & {
      fetchOptions?: Record<string, unknown>
      organizationId?: string
    }

    return authClient.organization.updateMemberRole({
      ...params,
      organizationId: input.organizationId ?? organizationId,
      fetchOptions: { ...input.fetchOptions, throw: true }
    } as UpdateMemberRoleParams<TAuthClient>)
  }

  return {
    mutationKey,
    mutationFn,
    meta: memberRoleMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
