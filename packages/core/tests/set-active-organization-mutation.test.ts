import { describe, expect, it, vi } from "vitest"
import { authQueryKeys } from "../src/lib/auth-query-keys"
import { organizationQueryKeys } from "../src/plugins/organization/organization-query-keys"
import { setActiveOrganizationOptions } from "../src/plugins/organization/set-active-organization-mutation"

describe("set active organization mutation", () => {
  it("refreshes the session and only the session-selected organization", () => {
    const options = setActiveOrganizationOptions(
      { organization: { setActive: vi.fn() } } as never,
      "user-1"
    )

    expect(options.meta).toEqual({
      awaits: [
        authQueryKeys.session,
        organizationQueryKeys.activeOrganization("user-1")
      ],
      invalidates: [organizationQueryKeys.lists("user-1")]
    })
  })
})
