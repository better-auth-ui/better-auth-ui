import { useMemo } from "react"
import type { AuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"
import { useActiveMemberRole } from "./get-active-member-role-query"

export type OrganizationPermissions = {
  organization: { update: boolean; delete: boolean }
  member: { create: boolean; update: boolean; delete: boolean }
  invitation: { create: boolean; cancel: boolean }
  team: { create: boolean; update: boolean; delete: boolean }
}

const EMPTY_PERMISSIONS: OrganizationPermissions = {
  organization: { update: false, delete: false },
  member: { create: false, update: false, delete: false },
  invitation: { create: false, cancel: false },
  team: { create: false, update: false, delete: false }
}

/**
 * Derive the current user's permission map for the active organization.
 *
 * Fetches the role server-side once, then computes each permission locally
 * via `checkRolePermission`. Use the returned map to gate UI elements.
 */
export function useOrganizationPermissions(authClient: AuthClient) {
  assertAuthClientHasOrganizationOrThrow(authClient)

  const { data: role, isPending, error } = useActiveMemberRole(authClient)

  const permissions = useMemo<OrganizationPermissions>(() => {
    if (!role) return EMPTY_PERMISSIONS

    const can = (resource: string, action: string) =>
      authClient.organization.checkRolePermission({
        role: role as Parameters<
          typeof authClient.organization.checkRolePermission
        >[0]["role"],
        permissions: { [resource]: [action] } as Parameters<
          typeof authClient.organization.checkRolePermission
        >[0]["permissions"]
      })

    return {
      organization: {
        update: can("organization", "update"),
        delete: can("organization", "delete")
      },
      member: {
        create: can("member", "create"),
        update: can("member", "update"),
        delete: can("member", "delete")
      },
      invitation: {
        create: can("invitation", "create"),
        cancel: can("invitation", "cancel")
      },
      team: {
        create: can("team", "create"),
        update: can("team", "update"),
        delete: can("team", "delete")
      }
    }
  }, [authClient, role])

  return { permissions, role, isPending, error }
}
