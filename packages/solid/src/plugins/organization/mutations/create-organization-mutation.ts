import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../organization-auth-client"
import { createOrganizationMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type CreateOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["create"]>[0]

export type CreateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["create"]>

export function createOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.create,
    organizationMutationKeys.create
  )
}

export function useCreateOrganization<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, options?: CreateOrganizationOptions<TAuthClient>) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.create,
    organizationMutationKeys.create,
    createOrganizationMeta,
    options
  )
}
