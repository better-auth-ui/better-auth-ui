import { skipToken } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  listUserTeamsOptions,
  organizationQueryKeys,
  setActiveTeamOptions
} from "../src/plugins/organization"

const createAuthClient = () => ({
  organization: {
    listUserTeams: vi.fn(async () => []),
    setActiveTeam: vi.fn(async () => null)
  }
})

describe("organization user team query", () => {
  it("waits for a user and an explicit organization id", () => {
    const authClient = createAuthClient() as never

    expect(listUserTeamsOptions(authClient, "user-1").queryFn).toBe(skipToken)
    expect(
      listUserTeamsOptions(authClient, undefined, {
        query: { organizationId: "org-1" }
      } as never).queryFn
    ).toBe(skipToken)
  })

  it("partitions the cache by organization", () => {
    const authClient = createAuthClient() as never
    const key = (organizationId: string) =>
      listUserTeamsOptions(authClient, "user-1", {
        query: { organizationId }
      } as never).queryKey

    expect(key("org-1")).not.toEqual(key("org-2"))
  })
})

describe("set active team mutation", () => {
  it("keeps organization scope in the public input without sending it to Better Auth", async () => {
    const authClient = createAuthClient()
    const options = setActiveTeamOptions(authClient as never, "user-1")

    await options.mutationFn?.(
      { organizationId: "org-1", teamId: "team-1" } as never,
      {} as never
    )

    expect(authClient.organization.setActiveTeam).toHaveBeenCalledWith({
      teamId: "team-1",
      fetchOptions: { throw: true }
    })
    expect(options.meta).toEqual(
      expect.objectContaining({
        invalidates: [organizationQueryKeys.teams.all("user-1")]
      })
    )
  })
})
