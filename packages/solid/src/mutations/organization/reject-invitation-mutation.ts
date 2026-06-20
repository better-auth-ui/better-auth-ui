import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { rejectInvitationMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type RejectInvitationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["rejectInvitation"]>[0]

export type RejectInvitationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["rejectInvitation"]>

export function rejectInvitationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.rejectInvitation,
    organizationMutationKeys.rejectInvitation
  )
}

export function useRejectInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: RejectInvitationOptions<TAuthClient>
) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.rejectInvitation,
    organizationMutationKeys.rejectInvitation,
    rejectInvitationMeta,
    options
  )
}
