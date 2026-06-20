import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { memberRoleMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type UpdateMemberRoleParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["updateMemberRole"]>[0]

export type UpdateMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["updateMemberRole"]>

export function updateMemberRoleOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.updateMemberRole,
    organizationMutationKeys.updateMemberRole
  )
}

export function useUpdateMemberRole<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UpdateMemberRoleOptions<TAuthClient>
) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.updateMemberRole,
    organizationMutationKeys.updateMemberRole,
    memberRoleMeta,
    options
  )
}
