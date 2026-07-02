import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission
} from "@better-auth-ui/react/plugins/organization"
import { AlertDialog, Button } from "@heroui/react"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { DeleteOrganizationDialog } from "./delete-organization-dialog"
import { DeleteOrganizationSkeleton } from "./delete-organization-skeleton"

/**
 * Danger-zone row to delete the active organization. Hidden for members without
 * the `organization:delete` permission.
 */
export function DeleteOrganization() {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )

  const { data: permission, isPending: permissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      permissions: { organization: ["delete"] }
    }
  )

  const [confirmOpen, setConfirmOpen] = useState(false)

  if (permissionPending) {
    return <DeleteOrganizationSkeleton />
  }

  if (!permission?.success) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium leading-tight">
          {organizationLocalization.deleteOrganization}
        </p>

        <p className="text-muted mt-0.5 text-xs">
          {organizationLocalization.deleteOrganizationDescription}
        </p>
      </div>

      <AlertDialog>
        <Button
          isDisabled={!activeOrganization}
          size="sm"
          variant="danger-soft"
          onPress={() => setConfirmOpen(true)}
        >
          {organizationLocalization.deleteOrganization}
        </Button>

        {activeOrganization && (
          <DeleteOrganizationDialog
            isOpen={confirmOpen}
            onOpenChange={setConfirmOpen}
            organization={activeOrganization}
          />
        )}
      </AlertDialog>
    </div>
  )
}
