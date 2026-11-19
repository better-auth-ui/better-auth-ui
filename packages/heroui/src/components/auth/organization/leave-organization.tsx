import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useActiveOrganization } from "@better-auth-ui/react/plugins/organization"
import { AlertDialog, Button } from "@heroui/react"
import { useState, type JSX } from "react"

import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"

/**
 * Danger-zone row to leave the active organization.
 */
export function LeaveOrganization(): JSX.Element {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(authClient)

  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium leading-tight">
          {organizationLocalization.leaveOrganization}
        </p>

        <p className="text-muted mt-0.5 text-xs">
          {organizationLocalization.leaveOrganizationDescription}
        </p>
      </div>

      <AlertDialog>
        <Button
          isDisabled={!activeOrganization}
          size="sm"
          variant="danger-soft"
          onPress={() => {
            setConfirmOpen(true)
          }}
        >
          {organizationLocalization.leaveOrganization}
        </Button>

        {activeOrganization && (
          <LeaveOrganizationDialog
            isOpen={confirmOpen}
            onOpenChange={setConfirmOpen}
            organization={activeOrganization}
          />
        )}
      </AlertDialog>
    </div>
  )
}
