import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { deleteOrganizationMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type DeleteOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["delete"]>[0]

export type DeleteOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["delete"]>

export function deleteOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.delete,
    organizationMutationKeys.delete
  )
}

export function useDeleteOrganization<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, options?: DeleteOrganizationOptions<TAuthClient>) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.delete,
    organizationMutationKeys.delete,
    deleteOrganizationMeta,
    options
  )
}
