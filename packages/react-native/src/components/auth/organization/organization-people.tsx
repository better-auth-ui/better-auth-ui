import { View } from "react-native"

import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { OrganizationInvitations } from "./organization-invitations"
import { OrganizationMembers } from "./organization-members"

/** Props for the {@link OrganizationPeople} component. */
export type OrganizationPeopleProps = SettingsViewProps

/**
 * Organization people UI: members list (see {@link OrganizationMembers}), then org
 * invitations (see {@link OrganizationInvitations}). Mirrors the heroui
 * `OrganizationPeople`, adapted for React Native: the wrapping `div` becomes a
 * `View`.
 */
export function OrganizationPeople({
  className,
  variant
}: OrganizationPeopleProps) {
  return (
    <View className={cn("flex-col gap-4", className)}>
      <OrganizationMembers variant={variant} />
      <OrganizationInvitations variant={variant} />
    </View>
  )
}
