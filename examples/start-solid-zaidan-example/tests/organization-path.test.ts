import { describe, expect, it } from "vitest"
import { createOrganizationPath } from "../src/components/auth/organization/organization-path"

describe("createOrganizationPath", () => {
  it("places the configured prefix directly before the route slug", () => {
    expect(
      createOrganizationPath({
        basePath: "/organization",
        slugPrefix: "@",
        slug: "acme",
        path: "settings"
      })
    ).toBe("/organization/@acme/settings")
  })

  it("keeps unprefixed organization routes compatible", () => {
    expect(
      createOrganizationPath({
        basePath: "/teams",
        slug: "acme",
        path: "people"
      })
    ).toBe("/teams/acme/people")
  })
})
