import { View } from "react-native"

import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { Organizations } from "./organizations"
import { UserInvitations } from "./user-invitations"

export type OrganizationsSettingsProps = SettingsViewProps

/**
 * Renders the organizations settings panel.
 *
 * Displays all organizations the user belongs to with an empty state and
 * create button, followed by a card for invitations to the user. Mirrors the
 * heroui `OrganizationsSettings` composition, adapted for React Native: the
 * outer `div` becomes a `View` and `variant` is forwarded to each card.
 *
 * @param className - Optional additional class names for the outer container.
 * @param variant - Card variant forwarded to each card.
 * @returns The organizations settings UI as a JSX element.
 */
export function OrganizationsSettings({
  className,
  variant
}: OrganizationsSettingsProps) {
  return (
    <View className={cn("flex-col gap-4", className)}>
      <Organizations variant={variant} />
      <UserInvitations variant={variant} />
    </View>
  )
}
