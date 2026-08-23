import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveMemberRole,
  useHasPermission
} from "@better-auth-ui/react/plugins/organization"
import type { CardProps } from "@heroui/react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { ApiKeys } from "./api-keys"

export type OrganizationApiKeysProps = {
  className?: string
  organizationId: string
  organizationSlug: string
  variant?: CardProps["variant"]
}

/**
 * {@link ApiKeys} scoped to an explicit organization.
 *
 * Access is resolved per API-key action. The configured organization creator
 * role receives Better Auth's creator override.
 */
export function OrganizationApiKeys({
  className,
  organizationId,
  variant
}: OrganizationApiKeysProps) {
  const { authClient } = useAuth()
  const client = authClient as OrganizationAuthClient
  const { creatorRole } = useAuthPlugin(organizationPlugin)
  const memberRole = useActiveMemberRole(client, {
    query: { organizationId }
  })
  const isCreator = hasMemberRole(memberRole.data?.role, creatorRole)
  const permissionOptions = {
    enabled: !memberRole.isPending && !isCreator,
    organizationId
  }
  const permissions = (action: string) =>
    ({ apiKey: [action] }) as Parameters<
      OrganizationAuthClient["organization"]["hasPermission"]
    >[0]["permissions"]
  const canRead = useHasPermission(client, {
    ...permissionOptions,
    permissions: permissions("read")
  })
  const canCreate = useHasPermission(client, {
    ...permissionOptions,
    permissions: permissions("create")
  })
  const canUpdate = useHasPermission(client, {
    ...permissionOptions,
    permissions: permissions("update")
  })
  const canDelete = useHasPermission(client, {
    ...permissionOptions,
    permissions: permissions("delete")
  })
  const permissionPending =
    !isCreator &&
    !memberRole.isPending &&
    (canRead.isPending ||
      canCreate.isPending ||
      canUpdate.isPending ||
      canDelete.isPending)
  const isPending = memberRole.isPending || permissionPending

  if (!isPending && !isCreator && !canRead.data?.success) return null

  return (
    <ApiKeys
      className={className}
      hideCreate={!isCreator && !canCreate.data?.success}
      hideDelete={!isCreator && !canDelete.data?.success}
      hideUpdate={!isCreator && !canUpdate.data?.success}
      isPending={isPending}
      variant={variant}
      organizationId={organizationId}
    />
  )
}
