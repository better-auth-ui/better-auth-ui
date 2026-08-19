import { skipToken } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import { activeMemberRoleOptions } from "../src/plugins/organization/active-member-role-query"

const createAuthClient = () => ({
  organization: {
    getActiveMemberRole: vi.fn(async () => ({ role: "owner" }))
  }
})

describe("activeMemberRoleOptions", () => {
  it("waits until it knows which organization to ask about", () => {
    const authClient = createAuthClient() as never

    // Firing without an organization would resolve against whatever the
    // session happens to consider active, which is not what the caller asked.
    expect(activeMemberRoleOptions(authClient, "user-1").queryFn).toBe(
      skipToken
    )
    expect(
      activeMemberRoleOptions(authClient, undefined, {
        query: { organizationId: "org-1" }
      } as never).queryFn
    ).toBe(skipToken)
  })

  it("accepts either an id or a slug", () => {
    const authClient = createAuthClient() as never

    for (const query of [
      { organizationId: "org-1" },
      { organizationSlug: "acme" }
    ]) {
      expect(
        activeMemberRoleOptions(authClient, "user-1", { query } as never)
          .queryFn
      ).not.toBe(skipToken)
    }
  })

  it("partitions the cache by user and by organization", () => {
    const authClient = createAuthClient() as never
    const forOrg = (organizationId: string, userId: string) =>
      JSON.stringify(
        activeMemberRoleOptions(authClient, userId, {
          query: { organizationId }
        } as never).queryKey
      )

    expect(forOrg("org-1", "user-1")).not.toBe(forOrg("org-2", "user-1"))
    expect(forOrg("org-1", "user-1")).not.toBe(forOrg("org-1", "user-2"))
  })
})
