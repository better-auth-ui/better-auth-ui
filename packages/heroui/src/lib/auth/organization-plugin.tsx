import {
  type AuthPluginBase,
  type AuthPluginLocalizationContext,
  createAuthPlugin
} from "@better-auth-ui/core"
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions
} from "@better-auth-ui/core/plugins/organization"
import { Briefcase } from "@gravity-ui/icons"
import { AcceptInvitation } from "../../components/auth/organization/accept-invitation"
import { OrganizationsSettings } from "../../components/auth/organization/organizations-settings"

export const organizationPlugin = createAuthPlugin(
  coreOrganizationPlugin.id,
  (options: OrganizationPluginOptions = {}) => {
    const coreOptions = coreOrganizationPlugin(options)
    const settingsTabs = (localization: OrganizationLocalization) => [
      {
        view: "organizations" as const,
        label: (
          <>
            <Briefcase className="text-muted" />
            {localization.organizations}
          </>
        ),
        component: OrganizationsSettings
      }
    ]

    return {
      ...coreOptions,
      localization: coreOptions.localization,
      views: {
        auth: { acceptInvitation: AcceptInvitation }
      },
      settingsTabs: settingsTabs(coreOptions.localization),
      _localizationResolver: (
        plugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => ({
        ...coreOptions._localizationResolver(plugin, context),
        settingsTabs: settingsTabs(
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the resolver receives this plugin's resolved localization
          context.localization as OrganizationLocalization
        )
      })
    }
  }
)
