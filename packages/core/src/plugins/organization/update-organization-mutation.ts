import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type UpdateOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["update"]>[0]

export type UpdateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof updateOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for updating an organization.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache invalidation.
 * @param organizationId - Optional organization ID fallback when params omit it.
 */
export function updateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string, organizationId?: string) {
  const mutationKey = organizationMutationKeys.update

  const mutationFn = (params: UpdateOrganizationParams<TAuthClient>) =>
    authClient.organization.update({
      ...params,
      organizationId: params.organizationId ?? organizationId,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [
        organizationQueryKeys.lists(userId),
        organizationQueryKeys.fullDetails(userId),
        organizationQueryKeys.activeOrganizations(userId)
      ]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
