import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useSession } from "@better-auth-ui/react"
import { useListOrganizationMembers } from "@better-auth-ui/react/plugins/organization"
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
 * Hidden for members whose role isn't `owner`. Better Auth's
 * `/organization/has-permission` endpoint isn't usable for `apiKey:*` checks
 * (it doesn't pass `allowCreatorAllPermissions` and the default org AC has no
 * `apiKey` statements), so we gate on role directly.
 */
export function OrganizationApiKeys({
  className,
  organizationId,
  variant
}: OrganizationApiKeysProps) {
  const { authClient } = useAuth()
  const { data: session } = useSession(authClient)

  const { data: membersData } = useListOrganizationMembers(
    authClient as OrganizationAuthClient,
    { query: { organizationId } }
  )

  const canManageApiKeys = membersData?.members.some(
    (member) =>
      hasMemberRole(member.role, "owner") && member.userId === session?.user.id
  )

  if (!canManageApiKeys) {
    return null
  }

  return (
    <ApiKeys
      className={className}
      variant={variant}
      organizationId={organizationId}
    />
  )
}
