import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type RemoveMemberFn<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = TAuthClient["organization"]["removeMember"]

export type RemoveMemberParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<RemoveMemberFn<TAuthClient>>[0]

export type RemoveMemberOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof removeMemberOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const removeMemberMeta = (userId: string | undefined) => ({
  awaits: [
    organizationQueryKeys.members.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ],
  invalidates: [organizationQueryKeys.lists(userId)]
})

export function removeMemberOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationKey = organizationMutationKeys.removeMember

  const mutationFn = (params: RemoveMemberParams<TAuthClient>) =>
    authClient.organization.removeMember({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: removeMemberMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
