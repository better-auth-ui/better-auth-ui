import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSetActiveOrganization } from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { Button } from "../../../primitives/button"
import { Spinner } from "../../../primitives/spinner"
import { Box } from "../../../primitives/styled"
import { Gear } from "../../../primitives/ui-icons"
import { OrganizationView } from "./organization-view"

export type OrganizationRowProps = {
  organization: Organization
}

/**
 * Single organization row: logo and labels via {@link OrganizationView}, plus Manage.
 * Mirrors the heroui `OrganizationRow`, adapted for React Native: the `div`
 * wrapper becomes a `View` and navigation goes through the RN navigation
 * adapter (`navigate({ to })`) rather than a raw URL join.
 */
export function OrganizationRow({ organization }: OrganizationRowProps) {
  const { authClient, basePaths, navigate } = useAuth()
  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths,
    slug,
    slugPrefix
  } = useAuthPlugin(organizationPlugin)

  const { mutate: setActiveOrganization, isPending: setActivePending } =
    useSetActiveOrganization(authClient as OrganizationAuthClient, {
      onSuccess: () => {
        navigate({
          to: `${basePaths.organization}/${organizationViewPaths.organization.settings}`
        })
      }
    })

  function manageOrganization() {
    if (slug !== undefined) {
      navigate({
        to: `${basePaths.organization}/${slugPrefix}${organization.slug}/${organizationViewPaths.organization.settings}`
      })
    } else {
      setActiveOrganization({ organizationId: organization.id })
    }
  }

  return (
    <Box className="flex-row items-center gap-3">
      <OrganizationView organization={organization} />

      <Button
        className="ml-auto shrink-0"
        variant="outline"
        size="sm"
        isPending={setActivePending}
        onPress={manageOrganization}
        aria-label={organizationLocalization.manage}
      >
        {setActivePending ? (
          <Spinner size="sm" color="current" />
        ) : (
          <Gear width={16} height={16} />
        )}

        {organizationLocalization.manage}
      </Button>
    </Box>
  )
}
