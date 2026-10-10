import {
  type AuthPluginBase,
  type AuthPluginLocalizationContext,
  createAuthPlugin
} from "@better-auth-ui/core"
import {
  dashPlugin as coreDashPlugin,
  type DashLocalization,
  type DashPluginOptions
} from "@better-auth-ui/core/plugins/dash"
import {
  AdminActivity,
  AdminUserActivity,
  OrganizationActivity,
  UserActivity
} from "../../components/auth/dash/activity"

const activityLabel = (label: string) => label

export const dashPlugin = createAuthPlugin(
  coreDashPlugin.id,
  (options: DashPluginOptions = {}) => {
    const core = coreDashPlugin(options)
    const localizedTabs = (localization: DashLocalization) => ({
      ...(core.admin
        ? {
            adminTabs: [
              {
                id: "activity",
                path: core.viewPaths.settings.activity,
                label: activityLabel(localization.activity),
                component: AdminActivity
              }
            ],
            adminUserTabs: [
              {
                id: "activity",
                label: activityLabel(localization.activity),
                component: AdminUserActivity
              }
            ]
          }
        : {}),
      ...(core.user
        ? {
            settingsTabs: [
              {
                view: "activity" as const,
                label: activityLabel(localization.activity),
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
                label: activityLabel(localization.activity),
                component: OrganizationActivity
              }
            ]
          }
        : {})
    })

    return {
      ...core,
      ...localizedTabs(core.localization),
      _localizationResolver: (
        plugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => ({
        ...plugin,
        ...localizedTabs(context.localization as DashLocalization)
      })
    }
  }
)
