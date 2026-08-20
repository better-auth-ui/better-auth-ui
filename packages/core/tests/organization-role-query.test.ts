import { skipToken } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  createRoleOptions,
  deleteRoleOptions,
  listRolesOptions,
  organizationQueryKeys,
  roleOptions
} from "../src/plugins/organization"

const createAuthClient = () => ({
  organization: {
    createRole: vi.fn(async (input) => input),
    deleteRole: vi.fn(async (input) => input),
    getRole: vi.fn(async () => null),
    listMembers: vi.fn(async () => ({ members: [], total: 0 })),
    listRoles: vi.fn(async () => []),
    updateRole: vi.fn(async (input) => input)
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

  it("rejects role mutations without an explicit organization id", async () => {
    const authClient = createAuthClient()
    const options = deleteRoleOptions(authClient as never, "user-1")

    await expect(
      options.mutationFn?.({ roleId: "role-1" } as never, {} as never)
    ).rejects.toThrow("organizationId is required for deleteRole")

    expect(authClient.organization.getRole).not.toHaveBeenCalled()
    expect(authClient.organization.deleteRole).not.toHaveBeenCalled()
  })

  it("rejects deletion when a member holds the role", async () => {
    const authClient = createAuthClient()
    authClient.organization.getRole.mockResolvedValueOnce({
      id: "role-1",
      role: "support",
      permission: {}
    } as never)
    authClient.organization.listMembers.mockResolvedValueOnce({
      members: [{ id: "member-1", role: "support" }],
      total: 1
    } as never)
    const options = deleteRoleOptions(authClient as never, "user-1", "org-1")

    await expect(
      options.mutationFn?.({ roleId: "role-1" } as never, {} as never)
    ).rejects.toThrow('Move members out of the "support" role')

    expect(authClient.organization.listMembers).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          organizationId: "org-1",
          filterField: "role",
          filterValue: "support",
          limit: 1
        })
      })
    )
    expect(authClient.organization.deleteRole).not.toHaveBeenCalled()
  })
})
