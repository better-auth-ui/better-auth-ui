import { describe, expect, it } from "vitest"
import {
  adminLocalization,
  adminMutationKeys,
  adminPlugin,
  isImpersonatingSession
} from "../src/plugins/admin"

describe("adminPlugin", () => {
  it("provides stable identity and merges localization overrides", () => {
    const plugin = adminPlugin({
      localization: { stopImpersonating: "Return to admin" }
    })

    expect(adminPlugin.id).toBe("admin")
    expect(plugin).toMatchObject({
      id: "admin",
      localization: {
        ...adminLocalization,
        stopImpersonating: "Return to admin"
      }
    })
  })

  it("keeps mutation keys under the shared auth namespace", () => {
    expect(adminMutationKeys).toEqual({
      all: ["auth", "admin"],
      stopImpersonating: ["auth", "admin", "stopImpersonating"]
    })
  })

  it("recognizes only sessions with a non-empty impersonator", () => {
    expect(
      isImpersonatingSession({
        session: { impersonatedBy: "admin-1" },
        user: { id: "user-1" }
      })
    ).toBe(true)
    expect(isImpersonatingSession({ session: { impersonatedBy: "" } })).toBe(
      false
    )
    expect(isImpersonatingSession({ session: {} })).toBe(false)
    expect(isImpersonatingSession(null)).toBe(false)
  })
})
