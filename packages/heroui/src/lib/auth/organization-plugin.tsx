import { createAuthPlugin } from "@better-auth-ui/core"
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions
} from "@better-auth-ui/core/plugins/organization"
import { Briefcase } from "@gravity-ui/icons"
import { OrganizationsSettings } from "../../components/auth/organization/organizations-settings"

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
            <>
              <Briefcase className="text-muted" />
              {coreOptions.localization.organizations}
            </>
          ),
          component: OrganizationsSettings
        }
      ]
    }
  }
)
