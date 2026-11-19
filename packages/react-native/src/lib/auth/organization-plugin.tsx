import {
  type AuthPluginBase,
  type AuthPluginLocalizationContext,
  createAuthPlugin
} from "@better-auth-ui/core"
import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { AcceptInvitation } from "../../components/auth/organization/accept-invitation"
import { OrganizationTeams } from "../../components/auth/organization/organization-teams"
import { OrganizationRoles } from "../../components/auth/organization/organization-roles"
import { OrganizationsSettings } from "../../components/auth/organization/organizations-settings"
import { Box, Txt } from "../../primitives/styled"
import { Briefcase } from "../../primitives/ui-icons"
import { useThemeColors } from "../theme-colors"
import {
  type NativeOrganizationPluginOptions,
  organizationPluginBase
} from "./organization-plugin-base"

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
  organizationPluginBase.id,
  (options: NativeOrganizationPluginOptions = {}) => {
    const coreOptions = organizationPluginBase(options)

    const settingsTabs = (localization: OrganizationLocalization) => [
      {
        view: "organizations" as const,
        label: <OrganizationsTabLabel label={localization.organizations} />,
        component: OrganizationsSettings
      }
    ]

    const organizationTabs = (localization: OrganizationLocalization) => [
      ...(coreOptions.teams
        ? [
            {
              id: "teams",
              path: coreOptions.viewPaths.organization.teams,
              label: localization.teams,
              component: OrganizationTeams
            }
          ]
        : []),
      ...(coreOptions.dynamicAccessControl?.enabled
        ? [
            {
              id: "roles",
              path: coreOptions.viewPaths.organization.roles,
              label: localization.roles,
              component: OrganizationRoles
            }
          ]
        : [])
    ]

    return {
      ...coreOptions,
      views: { auth: { acceptInvitation: AcceptInvitation } },
      organizationTabs: organizationTabs(coreOptions.localization),
      settingsTabs: settingsTabs(coreOptions.localization),
      _localizationResolver: (
        plugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => ({
        ...coreOptions._localizationResolver(plugin, context),
        organizationTabs: organizationTabs(
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the resolver receives this plugin's resolved localization
          context.localization as OrganizationLocalization
        ),
        settingsTabs: settingsTabs(
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the resolver receives this plugin's resolved localization
          context.localization as OrganizationLocalization
        )
      })
    }
  }
)
