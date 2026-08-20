import { skipToken } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  createRoleOptions,
  listRolesOptions,
  organizationQueryKeys,
  roleOptions
} from "../src/plugins/organization"

const createAuthClient = () => ({
  organization: {
    createRole: vi.fn(async (input) => input),
    getRole: vi.fn(async () => null),
    listRoles: vi.fn(async () => [])
  }
})

describe("organization role query factories", () => {
  it("waits for a user and an explicit organization id", () => {
    const authClient = createAuthClient() as never

    expect(listRolesOptions(authClient, "user-1").queryFn).toBe(skipToken)
    expect(
      listRolesOptions(authClient, undefined, {
        query: { organizationId: "org-1" }
      } as never).queryFn
    ).toBe(skipToken)
    expect(
      roleOptions(authClient, "user-1", {
        query: { organizationId: "org-1" }
      } as never).queryFn
    ).toBe(skipToken)
  })

  it("partitions list and detail caches by organization", () => {
    const authClient = createAuthClient() as never
    const listKey = (organizationId: string) =>
      listRolesOptions(authClient, "user-1", {
        query: { organizationId }
      } as never).queryKey
    const detailKey = (roleId: string) =>
      roleOptions(authClient, "user-1", {
        query: { organizationId: "org-1", roleId }
      } as never).queryKey

    expect(listKey("org-1")).not.toEqual(listKey("org-2"))
    expect(detailKey("role-1")).not.toEqual(detailKey("role-2"))
  })
})

describe("organization role mutation factories", () => {
  it("supplies the scoped organization and invalidates dependent access data", async () => {
    const authClient = createAuthClient()
    const options = createRoleOptions(authClient as never, "user-1", "org-1")

    await options.mutationFn?.(
      { role: "support", permission: { ticket: ["read"] } } as never,
      {} as never
    )

    expect(authClient.organization.createRole).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        role: "support",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )
    expect(options.meta).toEqual(
      expect.objectContaining({
        awaits: expect.arrayContaining([
          organizationQueryKeys.roles.all("user-1"),
          organizationQueryKeys.members.all("user-1"),
          organizationQueryKeys.invitations.all("user-1")
        ]),
        invalidates: [organizationQueryKeys.permissions.all("user-1")]
      })
    )
  })
})
