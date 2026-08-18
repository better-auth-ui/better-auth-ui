"use client"

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListOrganizations } from "@better-auth-ui/react/plugins/organization"
import { Fragment, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Item, ItemGroup, ItemSeparator } from "@/components/ui/item"
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
  const { authClient } = useAuth<OrganizationAuthClient>()
  const {
    allowOrganizationCreation,
    localization: organizationLocalization,
    organizationLimit
  } = useAuthPlugin(organizationPlugin)

  const [createOpen, setCreateOpen] = useState(false)

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient)
  const canCreate =
    allowOrganizationCreation &&
    (organizationLimit === undefined ||
      (organizations?.length ?? 0) < organizationLimit)

  return (
    <>
      <div className={className}>
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="truncate text-sm font-semibold">
              {organizationLocalization.organizations}
            </h2>

            {allowOrganizationCreation && (
              <Button
                className="shrink-0"
                size="sm"
                disabled={organizationsPending || !canCreate}
                onClick={() => setCreateOpen(true)}
              >
                {organizationLocalization.createOrganization}
              </Button>
            )}
          </div>

          <Card className="p-0">
            <CardContent className="p-0">
              {organizationsPending ? (
                <ItemGroup>
                  <Item>
                    <OrganizationViewSkeleton />
                  </Item>
                </ItemGroup>
              ) : !organizations?.length ? (
                <OrganizationsEmpty
                  canCreate={canCreate}
                  onCreatePress={() => setCreateOpen(true)}
                />
              ) : (
                <ItemGroup className="gap-0">
                  {organizations.map((organization, index) => (
                    <Fragment key={organization.id}>
                      {index > 0 && <ItemSeparator />}
                      <OrganizationRow organization={organization} />
                    </Fragment>
                  ))}
                </ItemGroup>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {canCreate && (
        <CreateOrganizationDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </>
  )
}
