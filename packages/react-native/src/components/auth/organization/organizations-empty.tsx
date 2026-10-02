import { useAuthPlugin } from "@better-auth-ui/react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { Button } from "../../../primitives/button"
import { EmptyState } from "../../../primitives/tabs"
import { Briefcase } from "../../../primitives/ui-icons"

export type OrganizationsEmptyProps = {
  onCreatePress: () => void
}

/**
 * Empty state for the organizations list. Mirrors the heroui
 * `OrganizationsEmpty`, adapted for React Native: the icon chip +
 * title/description + create button are composed via the `EmptyState`
 * primitive instead of raw `div`/`p`/`span` markup, and the gravity-ui
 * `Briefcase` icon becomes RN's `react-native-svg` `Briefcase`.
 */
export function OrganizationsEmpty({ onCreatePress }: OrganizationsEmptyProps) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <EmptyState
      icon={<Briefcase width={18} height={18} />}
      title={organizationLocalization.noOrganizations}
      description={organizationLocalization.organizationsDescription}
      action={
        <Button size="sm" onPress={onCreatePress}>
          {organizationLocalization.createOrganization}
        </Button>
      }
    />
  )
}
