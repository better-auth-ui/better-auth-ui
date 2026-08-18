import { createAuthPlugin } from "../../lib/create-auth-plugin"
import type {} from "../../lib/view-paths"
import type { BillingAdapter } from "./billing-adapter"
import {
  type BillingLocalization,
  billingLocalization
} from "./billing-localization"

declare module "../../lib/view-paths" {
  interface SettingsViewPaths {
    /** @default "billing" */
    billing?: string
  }
}

export type BillingPluginOptions = {
  adapter: BillingAdapter
  localization?: Partial<BillingLocalization>
  /** Add billing to personal settings. @default true */
  user?: boolean
  /** Add billing to organization settings. @default false */
  organization?: boolean
  /** @default "billing" */
  path?: string
}

export const billingPlugin = createAuthPlugin(
  "billing",
  (options: BillingPluginOptions) => ({
    adapter: options.adapter,
    localization: { ...billingLocalization, ...options.localization },
    user: options.user ?? true,
    organization: options.organization ?? false,
    viewPaths: {
      settings: { billing: options.path ?? "billing" }
    }
  })
)
