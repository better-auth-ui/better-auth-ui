import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type UpdateOrganizationFn<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = TAuthClient["organization"]["update"]

export type UpdateOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<UpdateOrganizationFn<TAuthClient>>[0]

export type UpdateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof updateOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const updateOrganizationMeta = (userId: string | undefined) => ({
  awaits: [
    organizationQueryKeys.lists(userId),
    organizationQueryKeys.fullDetails(userId),
    organizationQueryKeys.activeOrganizations(userId)
  ]
})

export function updateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string, organizationId?: string) {
  const mutationKey = organizationMutationKeys.update

  const mutationFn = (params: UpdateOrganizationParams<TAuthClient>) => {
    const input = params as UpdateOrganizationParams<TAuthClient> & {
      fetchOptions?: Record<string, unknown>
      organizationId?: string
    }

    return authClient.organization.update({
      ...params,
      organizationId: input.organizationId ?? organizationId,
      fetchOptions: { ...input.fetchOptions, throw: true }
    } as UpdateOrganizationParams<TAuthClient>)
  }

  return {
    mutationKey,
    mutationFn,
    meta: updateOrganizationMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
