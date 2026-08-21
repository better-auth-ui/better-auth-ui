import { createAuthPlugin } from "@better-auth-ui/core"
import {
  dashPlugin as coreDashPlugin,
  type DashLocalization,
  type DashPluginOptions
} from "@better-auth-ui/core/plugins/dash"
import { Activity } from "lucide-solid"

import {
  AdminUserActivity,
  OrganizationActivity,
  UserActivity
} from "@/components/auth/dash/activity"
import type { SolidSettingsTab } from "@/lib/auth/organization-plugin"

export const dashPlugin = createAuthPlugin(
  coreDashPlugin.id,
  (options: DashPluginOptions = {}) => {
    const core = coreDashPlugin(options)
    const ActivityLabel = () => (
      <span class="inline-flex items-center gap-1">
        <Activity class="size-4 text-muted-foreground" />
        {core.localization.activity}
      </span>
    )

    return {
      ...core,
      localization: core.localization as DashLocalization,
      ...(core.admin
        ? {
            adminUserTabs: [
              {
                id: "activity",
                label: ActivityLabel,
                component: AdminUserActivity
              }
            ]
          }
        : {}),
      ...(core.user
        ? {
            settingsTabs: [
              {
                view: "activity",
                tabLabel: ActivityLabel,
                component: UserActivity
              }
            ] satisfies SolidSettingsTab[]
          }
        : {}),
      ...(core.organization
        ? {
            organizationTabs: [
              {
                id: "activity",
                path: core.viewPaths.settings.activity,
                label: ActivityLabel,
                component: OrganizationActivity
              }
            ]
          }
        : {})
    }
  }
)
