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
import type { CardProps } from "@heroui/react"
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
  const { authClient } = useAuth<OrganizationAuthClient>()
  const client = authClient
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
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the API key plugin adds the apiKey resource, which the default organization access-control types do not list
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
