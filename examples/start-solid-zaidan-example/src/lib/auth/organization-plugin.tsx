import { createAuthPlugin } from "@better-auth-ui/core"
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationLocalization,
  type OrganizationPluginOptions
} from "@better-auth-ui/core/plugins/organization"
import { BriefcaseBusiness } from "lucide-solid"
import type { Component } from "solid-js"
import { OrganizationsSettings } from "@/components/auth/organization/organizations-settings"

export type SolidSettingsTab = {
  view: string
  tabLabel: Component
  component: Component
}

export const organizationPlugin = createAuthPlugin(
  coreOrganizationPlugin.id,
  (options: OrganizationPluginOptions = {}) => {
    const core = coreOrganizationPlugin(options)

    return {
      ...core,
      localization: core.localization as OrganizationLocalization,
      settingsTabs: [
        {
          view: "organizations",
          tabLabel: () => (
            <span class="inline-flex items-center gap-1">
              <BriefcaseBusiness class="size-4 text-muted-foreground" />
              {core.localization.organizations}
            </span>
          ),
          component: OrganizationsSettings
        }
      ] satisfies SolidSettingsTab[]
    }
  }
)
