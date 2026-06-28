import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OrganizationAuthClient } from "./organization-auth-client"
import { organizationMutationKeys } from "./organization-mutation-keys"
import { organizationQueryKeys } from "./organization-query-keys"

export type SetActiveOrganizationFn<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = TAuthClient["organization"]["setActive"]

export type SetActiveOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<SetActiveOrganizationFn<TAuthClient>>[0]

export type SetActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Omit<
  ReturnType<typeof setActiveOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export const setActiveOrganizationMeta = (userId: string | undefined) => ({
  awaits: [organizationQueryKeys.activeOrganizations(userId)],
  invalidates: [organizationQueryKeys.lists(userId)]
})

export function setActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationKey = organizationMutationKeys.setActive

  const mutationFn = (params: SetActiveOrganizationParams<TAuthClient>) =>
    authClient.organization.setActive({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: setActiveOrganizationMeta(userId)
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
