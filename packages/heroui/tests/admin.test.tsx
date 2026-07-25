import { describe, expect, it } from "vitest"

import { adminPlugin, StopImpersonating } from "../src/plugins"

describe("adminPlugin", () => {
  it("contributes the localized stop action to the user menu", () => {
    const plugin = adminPlugin({
      localization: { stopImpersonating: "Return to admin" }
    })

    expect(plugin.localization.stopImpersonating).toBe("Return to admin")
    expect(plugin.userMenuItems).toEqual([StopImpersonating])
  })
})
