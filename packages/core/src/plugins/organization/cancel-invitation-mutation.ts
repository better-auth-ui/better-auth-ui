import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type CancelInvitationFn<TAuthClient extends OrganizationAuthClient> =
  TAuthClient["organization"]["cancelInvitation"]

export type CancelInvitationParams<TAuthClient extends OrganizationAuthClient> =
  Parameters<CancelInvitationFn<TAuthClient>>[0]

export type CancelInvitationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof cancelInvitationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const cancelInvitationMeta = (userId: string | undefined) => ({
  awaits: [
    organizationQueryKeys.invitations.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ]
})

export function cancelInvitationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = organizationMutationKeys.cancelInvitation

  const mutationFn = (params: CancelInvitationParams<TAuthClient>) =>
    authClient.organization.cancelInvitation({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: cancelInvitationMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
