import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListOrganizations } from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { cn } from "../../../lib/cn"
import { Button } from "../../../primitives/button"
import { Card, type CardVariant } from "../../../primitives/card"
import { Box, Txt } from "../../../primitives/styled"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationRow } from "./organization-row"
import { OrganizationViewSkeleton } from "./organization-view-skeleton"
import { OrganizationsEmpty } from "./organizations-empty"

export type OrganizationsProps = {
  className?: string
  variant?: CardVariant
}

/**
 * Lists organizations the user belongs to (via {@link useListOrganizations}): loading skeleton,
 * empty state with create, or a card of rows with a Manage control per organization.
 * Owns {@link CreateOrganizationDialog} open state and the create actions. Mirrors the heroui
 * `Organizations`, adapted for React Native: `div`s become `View`s/`Text`s and the dashed row
 * separator is a bordered `View` instead of a CSS `border-b` rule.
 */
export function Organizations({ className, variant }: OrganizationsProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const [createOpen, setCreateOpen] = useState(false)

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient as OrganizationAuthClient)

  return (
    <>
      <Box className={cn("flex-col gap-3", className)}>
        <Box className="flex-row items-end justify-between gap-3">
          <Txt className="shrink truncate text-sm font-semibold text-foreground">
            {organizationLocalization.organizations}
          </Txt>

          <Button
            className="shrink-0"
            size="sm"
            isDisabled={organizationsPending}
            onPress={() => setCreateOpen(true)}
          >
            {organizationLocalization.createOrganization}
          </Button>
        </Box>

        <Card variant={variant}>
          <Card.Content className="gap-0">
            {organizationsPending ? (
              <OrganizationViewSkeleton />
            ) : !organizations?.length ? (
              <OrganizationsEmpty onCreatePress={() => setCreateOpen(true)} />
            ) : (
              organizations.map((organization, index) => (
                <Box key={organization.id}>
                  {index > 0 && (
                    <Box className="-mx-4 my-4 border-b border-dashed border-border" />
                  )}

                  <OrganizationRow organization={organization} />
                </Box>
              ))
            )}
          </Card.Content>
        </Card>
      </Box>

      <CreateOrganizationDialog
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
