import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../organization-auth-client"
import { leaveOrganizationMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type LeaveOrganizationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["leave"]>[0]

export type LeaveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["leave"]>

export function leaveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.leave,
    organizationMutationKeys.leave
  )
}

export function useLeaveOrganization<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient, options?: LeaveOrganizationOptions<TAuthClient>) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.leave,
    organizationMutationKeys.leave,
    leaveOrganizationMeta,
    options
  )
}
