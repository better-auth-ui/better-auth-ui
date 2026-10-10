import { afterEach, describe, expect, it, vi } from "vitest"
import { generateOrganizationSlug } from "../src/plugins/organization/generate-organization-slug"

afterEach(() => vi.unstubAllGlobals())

describe("generated organization slugs", () => {
  it("generates fallback slugs on native runtimes without Web Crypto", () => {
    vi.stubGlobal("crypto", undefined)
    expect(generateOrganizationSlug("組織")).toMatch(
      /^organization-[a-z0-9]+-[a-z0-9]+$/
    )
  })
  it("normalizes accents and separators without leaving edge separators", () => {
    expect(generateOrganizationSlug("  Café & Partners! ")).toBe(
      "cafe-partners"
    )
  })

  it.each(["組織", "!!!", ""])(
    "provides a valid unique fallback for %j",
    (name) => {
      const slug = generateOrganizationSlug(name)
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(generateOrganizationSlug(name)).not.toBe(slug)
    }
  )
})
