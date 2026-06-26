"use client"

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useListOrganizationMembers
} from "@better-auth-ui/react/plugins/organization"

import { ApiKeys } from "./api-keys"

export type OrganizationApiKeysProps = {
  className?: string
}

/**
 * {@link ApiKeys} scoped to the active organization.
 *
 * Hidden for members whose role isn't `owner`. Better Auth's
 * `/organization/has-permission` endpoint isn't usable for `apiKey:*` checks
 * (it doesn't pass `allowCreatorAllPermissions` and the default org AC has no
 * `apiKey` statements), so we gate on role directly.
 */
export function OrganizationApiKeys({ className }: OrganizationApiKeysProps) {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { data: session } = useSession(authClient)

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient)

  const { data: membersData } = useListOrganizationMembers(authClient)

  const canManageApiKeys = membersData?.members.some(
    (member) => member.role === "owner" && member.userId === session?.user.id
  )

  if (!canManageApiKeys) {
    return null
  }

  return (
    <ApiKeys
      className={className}
      organizationId={activeOrganization?.id}
      isPending={activeOrganizationPending}
    />
  )
}
