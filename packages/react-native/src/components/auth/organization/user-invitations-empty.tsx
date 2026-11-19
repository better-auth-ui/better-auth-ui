import { useAuthPlugin } from "@better-auth-ui/react"

import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { EmptyState } from "../../../primitives/tabs"
import { Send } from "../../../primitives/ui-icons"
import type { JSX } from "react/jsx-runtime"

/**
 * Empty state for `UserInvitations`. Mirrors the heroui
 * `UserInvitationsEmpty`, adapted for React Native: the gravity-ui
 * `PaperPlane` icon becomes RN's `react-native-svg` `Send`, and the icon
 * chip + title/description are composed via the `EmptyState` primitive
 * instead of raw `div`/`p`/`span` markup.
 */
export function UserInvitationsEmpty(): JSX.Element {
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
