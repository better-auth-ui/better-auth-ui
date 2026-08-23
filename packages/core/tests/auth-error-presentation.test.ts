import { describe, expect, it } from "vitest"
import { getAuthErrorPresentation } from "../src/lib/auth-error-presentation"

describe("getAuthErrorPresentation", () => {
  it("defaults unknown metadata to toast presentation", () => {
    expect(getAuthErrorPresentation(undefined)).toBe("toast")
    expect(getAuthErrorPresentation({ errorPresentation: "other" })).toBe(
      "toast"
    )
  })

  it.each(["inline", "silent"] as const)(
    "preserves %s presentation metadata",
    (presentation) => {
      expect(
        getAuthErrorPresentation({ errorPresentation: presentation })
      ).toBe(presentation)
    }
  )
})
