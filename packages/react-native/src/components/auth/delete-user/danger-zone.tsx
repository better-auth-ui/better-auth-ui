import { useAuth } from "@better-auth-ui/react"
import { Text, View } from "react-native"

import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { DeleteAccount } from "./delete-account"

export type DangerZoneProps = SettingsViewProps

/**
 * Renders the danger zone heading and {@link DeleteAccount}.
 * Registered as a `securityCard` by `deleteUserPlugin()`; gate by registering the plugin.
 */
export function DangerZone({ className, variant }: DangerZoneProps) {
  const { localization } = useAuth()

  return (
    <View className={cn("flex w-full flex-col", className)}>
      <Text className="mb-3 text-sm font-semibold text-danger">
        {localization.settings.dangerZone}
      </Text>

      <DeleteAccount variant={variant} />
    </View>
  )
}
