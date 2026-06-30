import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type RejectInvitationParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<TAuthClient["organization"]["rejectInvitation"]>[0]

export type RejectInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof rejectInvitationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for rejecting an organization invitation.
 *
 * @param authClient - The Better Auth organization client.
 * @param userId - The current signed-in user's ID. Used for cache invalidation.
 */
export function rejectInvitationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = organizationMutationKeys.rejectInvitation

  const mutationFn = (params: RejectInvitationParams<TAuthClient>) =>
    authClient.organization.rejectInvitation({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [organizationQueryKeys.userInvitations.all(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
