import { describe, expect, it } from "vitest"
import {
  lastLoginMethodLocalization,
  lastLoginMethodPlugin
} from "../src/plugins"

describe("lastLoginMethodPlugin", () => {
  it("provides stable identity and merges localization overrides", () => {
    const plugin = lastLoginMethodPlugin({
      localization: { lastUsed: "Previously used" }
    })

    expect(lastLoginMethodPlugin.id).toBe("lastLoginMethod")
    expect(plugin).toMatchObject({
      id: "lastLoginMethod",
      localization: {
        lastUsed: "Previously used",
        lastUsedShort: lastLoginMethodLocalization.lastUsedShort
      }
    })
  })
})
