"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useListOrganizations
} from "@better-auth-ui/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationRow } from "./organization-row"
import { OrganizationViewSkeleton } from "./organization-view-skeleton"
import { OrganizationsEmpty } from "./organizations-empty"

export type OrganizationsProps = {
  className?: string
}

/**
 * Lists organizations the user belongs to (via `useListOrganizations`): loading skeleton,
 * empty state with create, or a card of rows with a Manage control per organization.
 * Owns `CreateOrganizationDialog` open state and the create actions.
 */
export function Organizations({ className }: OrganizationsProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const [createOpen, setCreateOpen] = useState(false)

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient as OrganizationAuthClient)

  return (
    <>
      <div className={className}>
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="truncate text-sm font-semibold">
              {organizationLocalization.organizations}
            </h2>

            <Button
              className="shrink-0"
              size="sm"
              disabled={organizationsPending}
              onClick={() => setCreateOpen(true)}
            >
              {organizationLocalization.createOrganization}
            </Button>
          </div>

          <Card className="p-0">
            <CardContent className="p-0">
              {organizationsPending ? (
                <div className="p-4">
                  <OrganizationViewSkeleton />
                </div>
              ) : !organizations?.length ? (
                <OrganizationsEmpty onCreatePress={() => setCreateOpen(true)} />
              ) : (
                organizations.map((organization, index) => (
                  <div key={organization.id}>
                    {index > 0 && <Separator />}

                    <div className="p-4">
                      <OrganizationRow organization={organization} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateOrganizationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
