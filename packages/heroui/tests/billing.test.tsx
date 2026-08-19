import { describe, expect, it } from "vitest"

import {
  OrganizationBillingSettings,
  UserBillingSettings
} from "../src/components/auth/billing/billing-settings"
import { billingPlugin } from "../src/lib/auth/billing-plugin"

describe("billingPlugin (heroui)", () => {
  it("registers personal and organization billing settings", () => {
    const adapter = { id: "test" } as never
    const plugin = billingPlugin({
      adapter,
      organization: true,
      path: "plan"
    })

    expect(plugin.adapter).toBe(adapter)
    expect(plugin.settingsTabs?.[0]).toMatchObject({
      view: "billing",
      component: UserBillingSettings
    })
    expect(plugin.organizationTabs?.[0]).toMatchObject({
      id: "billing",
      path: "plan",
      component: OrganizationBillingSettings
    })
  })

  it("can limit billing to organization settings", () => {
    const plugin = billingPlugin({
      adapter: { id: "test" } as never,
      user: false,
      organization: true
    })

    expect(plugin.settingsTabs).toBeUndefined()
    expect(plugin.organizationTabs).toHaveLength(1)
  })

  it("defaults to personal billing at the billing path", () => {
    const plugin = billingPlugin({ adapter: { id: "test" } as never })

    expect(plugin.settingsTabs).toHaveLength(1)
    expect(plugin.organizationTabs).toBeUndefined()
    expect(plugin.viewPaths.settings.billing).toBe("billing")
  })
})
