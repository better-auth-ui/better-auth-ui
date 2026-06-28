import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type RejectInvitationFn<TAuthClient extends OrganizationAuthClient> =
  TAuthClient["organization"]["rejectInvitation"]

export type RejectInvitationParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<RejectInvitationFn<TAuthClient>>[0]

export type RejectInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof rejectInvitationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const rejectInvitationMeta = (userId: string | undefined) => ({
  awaits: [organizationQueryKeys.userInvitations.all(userId)]
})

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
    meta: rejectInvitationMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
