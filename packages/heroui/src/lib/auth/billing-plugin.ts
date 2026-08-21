import {
  type AuthPluginBase,
  type AuthPluginLocalizationContext,
  createAuthPlugin
} from "@better-auth-ui/core"
import {
  type BillingLocalization,
  type BillingPluginOptions,
  billingPlugin as coreBillingPlugin
} from "@better-auth-ui/core/plugins/billing"
import { CreditCard } from "@gravity-ui/icons"
import { createElement } from "react"

import {
  OrganizationBillingSettings,
  UserBillingSettings
} from "../../components/auth/billing/billing-settings"

const billingLabel = (label: string) =>
  createElement(
    "span",
    { className: "flex items-center gap-1" },
    createElement(CreditCard, { className: "text-muted" }),
    label
  )

export const billingPlugin = createAuthPlugin(
  coreBillingPlugin.id,
  (options: BillingPluginOptions) => {
    const core = coreBillingPlugin(options)
    const localizedTabs = (localization: BillingLocalization) => ({
      ...(core.user
        ? {
            settingsTabs: [
              {
                view: "billing" as const,
                label: billingLabel(localization.billing),
                component: UserBillingSettings
              }
            ]
          }
        : {}),
      ...(core.organization
        ? {
            organizationTabs: [
              {
                id: "billing",
                path: core.viewPaths.settings.billing,
                label: billingLabel(localization.billing),
                component: OrganizationBillingSettings
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
        ...localizedTabs(context.localization as BillingLocalization)
      })
    }
  }
)
