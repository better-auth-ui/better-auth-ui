"use client"

import {
  hasMemberRole,
  type OrganizationAuthClient,
  organizationPlugin
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveMemberRole,
  useHasPermission
} from "@better-auth-ui/react/plugins/organization"
import { ApiKeys } from "./api-keys"

export type OrganizationApiKeysProps = {
  className?: string
  organizationId: string
  organizationSlug: string
}

/**
 * {@link ApiKeys} scoped to an explicit organization.
 *
 * Access is resolved per API-key action. The configured organization creator
 * role receives Better Auth's creator override.
 */
type OrganizationPermissions = Parameters<
  OrganizationAuthClient["organization"]["hasPermission"]
>[0]["permissions"]

const apiKeyPermissions = (action: string) =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the API key plugin adds the apiKey resource, which the default organization access-control types do not list
  ({ apiKey: [action] }) as OrganizationPermissions

export function OrganizationApiKeys({
  className,
  organizationId
}: OrganizationApiKeysProps) {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { creatorRole } = useAuthPlugin(organizationPlugin)
  const memberRole = useActiveMemberRole(authClient, {
    query: { organizationId }
  })
  const isCreator = hasMemberRole(memberRole.data?.role, creatorRole)
  const permissionOptions = {
    enabled: !memberRole.isPending && !isCreator,
    organizationId
  }
  const canRead = useHasPermission(authClient, {
    ...permissionOptions,
    permissions: apiKeyPermissions("read")
  })
  const canCreate = useHasPermission(authClient, {
    ...permissionOptions,
    permissions: apiKeyPermissions("create")
  })
  const canUpdate = useHasPermission(authClient, {
    ...permissionOptions,
    permissions: apiKeyPermissions("update")
  })
  const canDelete = useHasPermission(authClient, {
    ...permissionOptions,
    permissions: apiKeyPermissions("delete")
  })
  const permissionPending =
    !isCreator &&
    !memberRole.isPending &&
    (canRead.isPending ||
      canCreate.isPending ||
      canUpdate.isPending ||
      canDelete.isPending)
  const isPending = memberRole.isPending || permissionPending
  const canReadKeys = isCreator || canRead.data?.success

  if (!isPending && !canReadKeys) return null

  return (
    <ApiKeys
      className={className}
      hideCreate={!isCreator && !canCreate.data?.success}
      hideDelete={!isCreator && !canDelete.data?.success}
      hideUpdate={!isCreator && !canUpdate.data?.success}
      isPending={isPending}
      organizationId={organizationId}
    />
  )
}
