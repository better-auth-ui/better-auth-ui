import { useAuthPlugin } from "@better-auth-ui/react"
import type { Organization } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
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
 * adapter with the organization slug.
 */
export function OrganizationRow({ organization }: OrganizationRowProps) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const navigation = useAuthNavigation()

  function manageOrganization() {
    navigation.push({
      section: "organization",
      view: "settings",
      slug: organization.slug
    })
  }

  return (
    <Box className="flex-row items-center gap-3">
      <OrganizationView organization={organization} />

      <Button
        className="ml-auto shrink-0"
        variant="outline"
        size="sm"
        onPress={manageOrganization}
        aria-label={organizationLocalization.manage}
      >
        <Gear width={16} height={16} />

        {organizationLocalization.manage}
      </Button>
    </Box>
  )
}
