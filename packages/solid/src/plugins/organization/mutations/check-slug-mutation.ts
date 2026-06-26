import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import { useMutation } from "@tanstack/solid-query"
import type { OrganizationAuthClient } from "../organization-auth-client"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions
} from "./utils"

export type CheckOrganizationSlugParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["checkSlug"]>[0]

export type CheckOrganizationSlugOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["checkSlug"]>

export function checkOrganizationSlugOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.checkSlug,
    organizationMutationKeys.checkSlug
  )
}

export function useCheckOrganizationSlug<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: CheckOrganizationSlugOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...checkOrganizationSlugOptions(authClient),
    ...options
  }))
}
