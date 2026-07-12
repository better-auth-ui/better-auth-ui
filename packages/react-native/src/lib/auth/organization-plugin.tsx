import { createAuthPlugin } from "@better-auth-ui/core"
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions
} from "@better-auth-ui/core/plugins"
import { Text, View } from "react-native"
import { OrganizationsSettings } from "../../components/auth/organization/organizations-settings"
import { Briefcase } from "../../primitives/ui-icons"
import { useThemeColors } from "../theme-colors"

function OrganizationsTabLabel({ label }: { label: string }) {
  const colors = useThemeColors()
  return (
    <View className="flex-row items-center gap-1.5">
      <Briefcase width={16} height={16} color={colors.muted} />
      <Text className="text-muted">{label}</Text>
    </View>
  )
}

/**
 * React Native organization plugin. Adds an "Organizations" settings tab whose
 * panel is `OrganizationsSettings`. Mirrors the heroui registration.
 */
export const organizationPlugin = createAuthPlugin(
  coreOrganizationPlugin.id,
  (options: OrganizationPluginOptions = {}) => {
    const coreOptions = coreOrganizationPlugin(options)

    return {
      ...coreOptions,
      localization: coreOptions.localization as OrganizationLocalization,
      settingsTabs: [
        {
          view: "organizations",
          label: (
            <OrganizationsTabLabel
              label={coreOptions.localization.organizations}
            />
          ),
          component: OrganizationsSettings
        }
      ]
    }
  }
)
