import { organizationMutationKeys } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { removeMemberMeta } from "./metadata"
import {
  createOrganizationMutationOptions,
  type OrganizationMutationOptions,
  useOrganizationMutation
} from "./utils"

export type RemoveMemberParams<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["removeMember"]>[0]

export type RemoveMemberOptions<
  TAuthClient extends OrganizationAuthClient = OrganizationAuthClient
> = OrganizationMutationOptions<TAuthClient["organization"]["removeMember"]>

export function removeMemberOptions<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient
) {
  return createOrganizationMutationOptions(
    authClient.organization.removeMember,
    organizationMutationKeys.removeMember
  )
}

export function useRemoveMember<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: RemoveMemberOptions<TAuthClient>
) {
  return useOrganizationMutation(
    authClient,
    authClient.organization.removeMember,
    organizationMutationKeys.removeMember,
    removeMemberMeta,
    options
  )
}
