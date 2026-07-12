import { useAuthPlugin } from "@better-auth-ui/react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { EmptyState } from "../../../primitives/tabs"
import { Send } from "../../../primitives/ui-icons"

/**
 * Empty state for `UserInvitations`. Mirrors the heroui
 * `UserInvitationsEmpty`, adapted for React Native: the gravity-ui
 * `PaperPlane` icon becomes RN's `react-native-svg` `Send`, and the icon
 * chip + title/description are composed via the `EmptyState` primitive
 * instead of raw `div`/`p`/`span` markup.
 */
export function UserInvitationsEmpty() {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <EmptyState
      icon={<Send width={18} height={18} />}
      title={organizationLocalization.noInvitations}
      description={organizationLocalization.userInvitationsEmptyDescription}
    />
  )
}
