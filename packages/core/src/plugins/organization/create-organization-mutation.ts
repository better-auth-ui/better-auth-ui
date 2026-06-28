import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type CreateOrganizationFn<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = TAuthClient["organization"]["create"]

export type CreateOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<CreateOrganizationFn<TAuthClient>>[0]

export type CreateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof createOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const createOrganizationMeta = (userId: string | undefined) => ({
  awaits: [organizationQueryKeys.lists(userId)],
  invalidates: [
    organizationQueryKeys.fullDetails(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export function createOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = organizationMutationKeys.create

  const mutationFn = (params: CreateOrganizationParams<TAuthClient>) =>
    authClient.organization.create({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: createOrganizationMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
