import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type UpdateMemberRoleParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["updateMemberRole"]>[0]

export type UpdateMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof updateMemberRoleOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for updating a member's organization role.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache invalidation.
 * @param organizationId - Optional organization ID fallback when params omit it.
 */
export function updateMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string, organizationId?: string) {
  const mutationKey = organizationMutationKeys.updateMemberRole

  const mutationFn = (params: UpdateMemberRoleParams<TAuthClient>) =>
    authClient.organization.updateMemberRole({
      ...params,
      organizationId: params.organizationId ?? organizationId,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [
        organizationQueryKeys.members.all(userId),
        organizationQueryKeys.fullDetails(userId)
      ],
      invalidates: [organizationQueryKeys.permissions.all(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
