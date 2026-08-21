import { createAuthPlugin } from "@better-auth-ui/core"
import {
  dashPlugin as coreDashPlugin,
  type DashPluginOptions
} from "@better-auth-ui/core/plugins/dash"
import { Pulse } from "@gravity-ui/icons"
import { createElement } from "react"
import {
  OrganizationActivity,
  UserActivity
} from "../../components/auth/dash/activity"

const activityLabel = (label: string) =>
  createElement(
    "span",
    { className: "flex items-center gap-1" },
    createElement(Pulse, { className: "text-muted" }),
    label
  )

export const dashPlugin = createAuthPlugin(
  coreDashPlugin.id,
  (options: DashPluginOptions = {}) => {
    const core = coreDashPlugin(options)
    return {
      ...core,
      ...(core.user
        ? {
            settingsTabs: [
              {
                view: "activity" as const,
                label: activityLabel(core.localization.activity),
                component: UserActivity
              }
            ]
          }
        : {}),
      ...(core.organization
        ? {
            organizationTabs: [
              {
                id: "activity",
                path: core.viewPaths.settings.activity,
                label: activityLabel(core.localization.activity),
                component: OrganizationActivity
              }
            ]
          }
        : {})
    }
  }
)
