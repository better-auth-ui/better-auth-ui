import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type LeaveOrganizationFn<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = TAuthClient["organization"]["leave"]

export type LeaveOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<LeaveOrganizationFn<TAuthClient>>[0]

export type LeaveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof leaveOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const leaveOrganizationMeta = (userId: string | undefined) => ({
  awaits: [
    organizationQueryKeys.members.all(userId),
    organizationQueryKeys.fullDetails(userId)
  ],
  invalidates: [
    organizationQueryKeys.lists(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export function leaveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = organizationMutationKeys.leave

  const mutationFn = (params: LeaveOrganizationParams<TAuthClient>) =>
    authClient.organization.leave({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: leaveOrganizationMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
