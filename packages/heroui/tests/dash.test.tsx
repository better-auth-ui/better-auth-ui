import { describe, expect, it } from "vitest"
import {
  OrganizationActivity,
  UserActivity
} from "../src/components/auth/dash/activity"
import { dashPlugin } from "../src/lib/auth/dash-plugin"

describe("dashPlugin (heroui)", () => {
  it("registers both static activity tabs by default", () => {
    const plugin = dashPlugin({ path: "history" })

    expect(plugin.settingsTabs?.[0]).toMatchObject({
      view: "activity",
      component: UserActivity
    })
    expect(plugin.organizationTabs?.[0]).toMatchObject({
      id: "activity",
      path: "history",
      component: OrganizationActivity
    })
  })

  it("can expose only one activity surface", () => {
    const personal = dashPlugin({ organization: false })
    const organization = dashPlugin({ user: false })

    expect(personal.settingsTabs).toHaveLength(1)
    expect(personal.organizationTabs).toBeUndefined()
    expect(organization.settingsTabs).toBeUndefined()
    expect(organization.organizationTabs).toHaveLength(1)
  })
})
