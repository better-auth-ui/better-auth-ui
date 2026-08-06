import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type InviteMemberParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["inviteMember"]>[0]

export type InviteMemberOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof inviteMemberOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for inviting a member to an organization.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache invalidation.
 * @param organizationId - Optional organization ID fallback when params omit it.
 */
export function inviteMemberOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  organizationId?: string
) {
  const mutationKey = organizationMutationKeys.inviteMember

  const mutationFn = (params: InviteMemberParams<TAuthClient>) =>
    authClient.organization.inviteMember({
      ...params,
      organizationId: params.organizationId ?? organizationId,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [
        organizationQueryKeys.invitations.all(userId),
        organizationQueryKeys.fullDetails(userId)
      ]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
