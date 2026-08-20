import { createAuthPlugin } from "@better-auth-ui/core"
import {
  type BillingLocalization,
  type BillingPluginOptions,
  billingPlugin as coreBillingPlugin
} from "@better-auth-ui/core/plugins/billing"
import { CreditCard } from "lucide-solid"

import {
  OrganizationBillingSettings,
  UserBillingSettings
} from "@/components/auth/billing/billing-settings"
import type { SolidSettingsTab } from "@/lib/auth/organization-plugin"

export const billingPlugin = createAuthPlugin(
  coreBillingPlugin.id,
  (options: BillingPluginOptions) => {
    const core = coreBillingPlugin(options)

    const BillingLabel = () => (
      <span class="inline-flex items-center gap-1">
        <CreditCard class="size-4 text-muted-foreground" />
        {core.localization.billing}
      </span>
    )

    return {
      ...core,
      localization: core.localization as BillingLocalization,
      ...(core.user
        ? {
            settingsTabs: [
              {
                view: "billing",
                tabLabel: BillingLabel,
                component: UserBillingSettings
              }
            ] satisfies SolidSettingsTab[]
          }
        : {}),
      ...(core.organization
        ? {
            organizationTabs: [
              {
                id: "billing",
                path: core.viewPaths.settings.billing,
                label: BillingLabel,
                component: OrganizationBillingSettings
              }
            ]
          }
        : {})
    }
  }
)
