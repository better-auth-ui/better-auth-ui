import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { inviteMemberMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type InviteMemberParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["inviteMember"]>[0]

export type InviteMemberOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["inviteMember"]>

export function inviteMemberOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient
) {
  return createOrganizationMutationOptions(
    authClient.organization.inviteMember,
    organizationMutationKeys.inviteMember
  )
}

export function useInviteMember<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: InviteMemberOptions<TAuthClient>
) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.inviteMember,
    organizationMutationKeys.inviteMember,
    inviteMemberMeta,
    options
  )
}
