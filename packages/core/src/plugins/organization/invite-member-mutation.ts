import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type InviteMemberFn<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = TAuthClient["organization"]["inviteMember"]

export type InviteMemberParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<InviteMemberFn<TAuthClient>>[0]

export type InviteMemberOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof inviteMemberOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const inviteMemberMeta = (userId: string | undefined) => ({
  awaits: [
    organizationQueryKeys.invitations.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ]
})

export function inviteMemberOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  userId?: string,
  organizationId?: string
) {
  const mutationKey = organizationMutationKeys.inviteMember

  const mutationFn = (params: InviteMemberParams<TAuthClient>) => {
    const input = params as InviteMemberParams<TAuthClient> & {
      fetchOptions?: Record<string, unknown>
      organizationId?: string
    }

    return authClient.organization.inviteMember({
      ...params,
      organizationId: input.organizationId ?? organizationId,
      fetchOptions: { ...input.fetchOptions, throw: true }
    } as InviteMemberParams<TAuthClient>)
  }

  return {
    mutationKey,
    mutationFn,
    meta: inviteMemberMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
