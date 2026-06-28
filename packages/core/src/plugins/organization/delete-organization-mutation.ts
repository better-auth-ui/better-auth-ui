import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type DeleteOrganizationFn<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = TAuthClient["organization"]["delete"]

export type DeleteOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<DeleteOrganizationFn<TAuthClient>>[0]

export type DeleteOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof deleteOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const deleteOrganizationMeta = (userId: string | undefined) => ({
  awaits: [organizationQueryKeys.lists(userId)],
  invalidates: [
    organizationQueryKeys.fullDetails(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export function deleteOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = organizationMutationKeys.delete

  const mutationFn = (params: DeleteOrganizationParams<TAuthClient>) =>
    authClient.organization.delete({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: deleteOrganizationMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
