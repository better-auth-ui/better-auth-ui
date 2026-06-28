import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListOrganizations } from "@better-auth-ui/react/plugins/organization"
import { Button, Card, type CardProps } from "@heroui/react"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationRow } from "./organization-row"
import { OrganizationViewSkeleton } from "./organization-view-skeleton"
import { OrganizationsEmpty } from "./organizations-empty"

export type OrganizationsProps = {
  variant?: CardProps["variant"]
}

/**
 * Lists organizations the user belongs to (via {@link useListOrganizations}): loading skeleton,
 * empty state with create, or a card of rows with a Manage control per organization.
 * Owns {@link CreateOrganizationDialog} open state and the create actions.
 */
export function Organizations({ variant }: OrganizationsProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const [createOpen, setCreateOpen] = useState(false)

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient as OrganizationAuthClient)

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="truncate text-sm font-semibold">
            {organizationLocalization.organizations}
          </h2>

          <Button
            className="shrink-0"
            size="sm"
            isDisabled={organizationsPending}
            onPress={() => setCreateOpen(true)}
          >
            {organizationLocalization.createOrganization}
          </Button>
        </div>

        <Card variant={variant}>
          <Card.Content className="gap-0">
            {organizationsPending ? (
              <OrganizationViewSkeleton />
            ) : !organizations?.length ? (
              <OrganizationsEmpty onCreatePress={() => setCreateOpen(true)} />
            ) : (
              organizations.map((organization, index) => (
                <div key={organization.id}>
                  {index > 0 && (
                    <div className="-mx-4 my-4 border-b border-dashed" />
                  )}

                  <OrganizationRow organization={organization} />
                </div>
              ))
            )}
          </Card.Content>
        </Card>
      </div>

      <CreateOrganizationDialog
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
