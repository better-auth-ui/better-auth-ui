import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { cancelInvitationMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type CancelInvitationParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["cancelInvitation"]>[0]

export type CancelInvitationOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["cancelInvitation"]>

export function cancelInvitationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  return createOrganizationMutationOptions(
    authClient.organization.cancelInvitation,
    organizationMutationKeys.cancelInvitation
  )
}

export function useCancelInvitation<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: CancelInvitationOptions<TAuthClient>
) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.cancelInvitation,
    organizationMutationKeys.cancelInvitation,
    cancelInvitationMeta,
    options
  )
}
