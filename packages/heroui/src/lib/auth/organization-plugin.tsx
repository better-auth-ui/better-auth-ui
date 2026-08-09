import { createAuthPlugin } from "@better-auth-ui/core"
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions
} from "@better-auth-ui/core/plugins"
import { Briefcase } from "@gravity-ui/icons"
import { AcceptInvitation } from "../../components/auth/organization/accept-invitation"
import { OrganizationsSettings } from "../../components/auth/organization/organizations-settings"

export const organizationPlugin = createAuthPlugin(
  coreOrganizationPlugin.id,
  (options: OrganizationPluginOptions = {}) => {
    const coreOptions = coreOrganizationPlugin(options)

    return {
      ...coreOptions,
      localization: coreOptions.localization as OrganizationLocalization,
      views: {
        auth: { acceptInvitation: AcceptInvitation }
      },
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
