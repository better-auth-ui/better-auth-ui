"use client"

import {
  type OrganizationAuthClient,
  useActiveOrganization,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"

/**
 * Danger-zone row to leave the active organization.
 */
export function LeaveOrganization() {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )

  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium leading-tight">
          {organizationLocalization.leaveOrganization}
        </p>

        <p className="text-muted-foreground mt-0.5 text-xs">
          {organizationLocalization.leaveOrganizationDescription}
        </p>
      </div>

      <Button
        disabled={!activeOrganization}
        size="sm"
        variant="outline"
        className="text-destructive"
        onClick={() => setConfirmOpen(true)}
      >
        {organizationLocalization.leaveOrganization}
      </Button>

      {activeOrganization && (
        <LeaveOrganizationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          organization={activeOrganization}
        />
      )}
    </div>
  )
}
