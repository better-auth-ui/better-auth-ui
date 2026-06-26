import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../organization-auth-client"
import { acceptInvitationMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type AcceptInvitationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["acceptInvitation"]>[0]

export type AcceptInvitationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["acceptInvitation"]>

export function acceptInvitationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.acceptInvitation,
    organizationMutationKeys.acceptInvitation
  )
}

export function useAcceptInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: AcceptInvitationOptions<TAuthClient>
) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.acceptInvitation,
    organizationMutationKeys.acceptInvitation,
    acceptInvitationMeta,
    options
  )
}
