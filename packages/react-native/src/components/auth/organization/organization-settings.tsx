import { useAuth } from "@better-auth-ui/react"
import { View } from "react-native"

import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { OrganizationDangerZone } from "./organization-danger-zone"
import { OrganizationProfile } from "./organization-profile"

export type OrganizationSettingsProps = SettingsViewProps

/**
 * Organization settings UI: profile card, plugin-contributed cards
 * (`organizationCards`), then danger zone. Mirrors the heroui
 * `OrganizationSettings`, adapted for React Native: the outer `div` becomes a
 * `View` and `variant` is forwarded to each card.
 *
 * @param className - Optional additional class names for the outer container.
 * @param variant - Card variant forwarded to each card.
 * @returns The organization settings UI as a JSX element.
 */
export function OrganizationSettings({
  className,
  variant
}: OrganizationSettingsProps) {
  const { plugins } = useAuth()

  return (
    <View className={cn("flex-col gap-4", className)}>
      <OrganizationProfile variant={variant} />

      {plugins.flatMap((plugin) =>
        plugin.organizationCards?.map((Card, index) => (
          <Card key={`${plugin.id}-${index.toString()}`} variant={variant} />
        ))
      )}

      <OrganizationDangerZone variant={variant} />
    </View>
  )
}
