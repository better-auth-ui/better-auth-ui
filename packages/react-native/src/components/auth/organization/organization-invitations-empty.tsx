import { useAuthPlugin } from "@better-auth-ui/react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { Button } from "../../../primitives/button"
import { EmptyState } from "../../../primitives/tabs"
import { Send } from "../../../primitives/ui-icons"

export type OrganizationInvitationsEmptyProps = {
  onInvitePress: () => void
}

/**
 * Empty state for {@link OrganizationInvitations} — mirrors `ApiKeysEmpty`
 * (icon, title, description) with an "Invite member" call to action. Mirrors
 * the heroui `OrganizationInvitationsEmpty`, adapted for React Native: the
 * gravity-ui `PaperPlane` icon becomes RN's `react-native-svg` `Send`, and
 * the icon chip + title/description + action button are composed via the
 * `EmptyState` primitive instead of raw `div`/`p`/`span` markup.
 */
export function OrganizationInvitationsEmpty({
  onInvitePress
}: OrganizationInvitationsEmptyProps) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <EmptyState
      icon={<Send width={18} height={18} />}
      title={organizationLocalization.noInvitations}
      description={
        organizationLocalization.organizationInvitationsEmptyDescription
      }
      action={
        <Button size="sm" onPress={onInvitePress}>
          {organizationLocalization.inviteMember}
        </Button>
      }
    />
  )
}
