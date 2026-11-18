import { createAuthPlugin } from "@better-auth-ui/core"
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationPluginOptions
} from "@better-auth-ui/core/plugins/organization"
import { Briefcase } from "lucide-react"

import { AcceptInvitation } from "@/components/auth/organization/accept-invitation"
import { OrganizationsSettings } from "@/components/auth/organization/organizations-settings"

export const organizationPlugin = createAuthPlugin(
  coreOrganizationPlugin.id,
  (options: OrganizationPluginOptions = {}) => {
    const core = coreOrganizationPlugin(options)

    return {
      ...core,
      localization: core.localization,
      views: {
        auth: { acceptInvitation: AcceptInvitation }
      },
      settingsTabs: [
        {
          view: "organizations",
          label: (
            <>
              <Briefcase className="text-muted-foreground" />
              {core.localization.organizations}
            </>
          ),
          component: OrganizationsSettings
        }
      ]
    }
  }
)
