import { createAuthPlugin } from "@better-auth-ui/core"
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions
} from "@better-auth-ui/core/plugins"
import { OrganizationsSettings } from "../../components/auth/organization/organizations-settings"
import { Box, Txt } from "../../primitives/styled"
import { Briefcase } from "../../primitives/ui-icons"
import { useThemeColors } from "../theme-colors"

function OrganizationsTabLabel({ label }: { label: string }) {
  const colors = useThemeColors()
  return (
    <Box className="flex-row items-center gap-1.5">
      <Briefcase width={16} height={16} color={colors.muted} />
      <Txt className="text-muted">{label}</Txt>
    </Box>
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
