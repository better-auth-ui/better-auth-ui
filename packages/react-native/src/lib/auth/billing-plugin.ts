import {
  createAuthPlugin,
  type AuthPluginBase,
  type AuthPluginLocalizationContext
} from "@better-auth-ui/core"
import {
  billingPlugin as coreBillingPlugin,
  type BillingPluginOptions,
  type BillingLocalization
} from "@better-auth-ui/core/plugins/billing"
import {
  UserBillingSettings,
  OrganizationBillingSettings
} from "../../components/auth/billing/billing-settings"

export const billingPlugin = createAuthPlugin(
  coreBillingPlugin.id,
  (options: BillingPluginOptions) => {
    const core = coreBillingPlugin(options)
    const tabs = (localization: BillingLocalization) => ({
      ...(core.user && {
        settingsTabs: [
          {
            view: "billing" as const,
            label: localization.billing,
            component: UserBillingSettings
          }
        ]
      }),
      ...(core.organization && {
        organizationTabs: [
          {
            id: "billing",
            path: core.viewPaths.settings.billing,
            label: localization.billing,
            component: OrganizationBillingSettings
          }
        ]
      })
    })
    return {
      ...core,
      ...tabs(core.localization),
      _localizationResolver: (
        plugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => ({ ...plugin, ...tabs(context.localization as BillingLocalization) })
    }
  }
)
