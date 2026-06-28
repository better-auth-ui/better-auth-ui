import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type AcceptInvitationFn<TAuthClient extends OrganizationAuthClient> =
  TAuthClient["organization"]["acceptInvitation"]

export type AcceptInvitationParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<AcceptInvitationFn<TAuthClient>>[0]

export type AcceptInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof acceptInvitationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const acceptInvitationMeta = (userId: string | undefined) => ({
  awaits: [
    organizationQueryKeys.userInvitations.all(userId),
    organizationQueryKeys.lists(userId)
  ],
  invalidates: [
    organizationQueryKeys.fullDetails(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export function acceptInvitationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = organizationMutationKeys.acceptInvitation

  const mutationFn = (params: AcceptInvitationParams<TAuthClient>) =>
    authClient.organization.acceptInvitation({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: acceptInvitationMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
