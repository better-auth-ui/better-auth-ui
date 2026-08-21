import { skipToken } from "@tanstack/query-core"
import { describe, expect, it, vi } from "vitest"
import {
  adminLocalization,
  adminMutationKeys,
  adminPlugin,
  adminQueryKeys,
  adminUserOptions,
  adminUsersOptions,
  createAdminUserOptions,
  isImpersonatingSession,
  resolveAdminPath,
  revokeAdminUserSessionOptions,
  setAdminUserPasswordOptions
} from "../src/plugins/admin"

const usersResponse = { users: [], total: 0 }

const createAuthClient = () => ({
  admin: {
    listUsers: vi.fn(async () => ({ data: usersResponse, error: null }))
  }
})

describe("adminPlugin", () => {
  it("resolves only exact finite admin paths", () => {
    const entries = [
      { id: "root", path: "" },
      { id: "users", path: "users" },
      { id: "activity", path: "activity" }
    ]

    expect(resolveAdminPath("", entries)).toEqual(entries[0])
    expect(resolveAdminPath("users", entries)).toEqual(entries[1])
    expect(resolveAdminPath("users/example", entries)).toBeUndefined()
    expect(resolveAdminPath("unknown", entries)).toBeUndefined()
  })

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

  it("normalizes user-management options", () => {
    expect(adminPlugin()).toMatchObject({
      defaultRole: "user",
      pageSize: 20,
      roles: ["user", "admin"],
      showIpAddress: false
    })

    expect(
      adminPlugin({
        defaultRole: "owner",
        pageSize: 500,
        roles: ["member", "member", ""]
      })
    ).toMatchObject({
      defaultRole: "owner",
      pageSize: 100,
      roles: ["owner", "member"]
    })
  })

  it("keeps mutation keys under the shared auth namespace", () => {
    for (const key of Object.values(adminMutationKeys)) {
      expect(key.slice(0, 2)).toEqual(["auth", "admin"])
    }
  })

  it("partitions user lists by acting user and request parameters", () => {
    const params = { limit: 20, offset: 0, searchField: "email" as const }

    expect(adminQueryKeys.users.list("admin-1", params)).not.toEqual(
      adminQueryKeys.users.list("admin-2", params)
    )
    expect(adminQueryKeys.users.list("admin-1", params)).not.toEqual(
      adminQueryKeys.users.list("admin-1", { ...params, offset: 20 })
    )
  })

  it("waits for a session and forwards list filters", async () => {
    const authClient = createAuthClient()
    const params = {
      limit: 25,
      offset: 50,
      searchField: "name" as const,
      searchValue: "Ada"
    }

    expect(adminUsersOptions(authClient as never).queryFn).toBe(skipToken)

    const options = adminUsersOptions(authClient as never, "admin-1", params)
    const signal = new AbortController().signal
    const data = await (
      options.queryFn as (context: {
        signal: AbortSignal
      }) => Promise<typeof usersResponse>
    )({ signal })

    expect(data).toBe(usersResponse)
    expect(authClient.admin.listUsers).toHaveBeenCalledWith({
      query: params,
      fetchOptions: { signal }
    })
  })

  it("does not fetch an inspector user without an actor and target", () => {
    const authClient = { admin: { getUser: vi.fn() } }

    expect(adminUserOptions(authClient as never).queryFn).toBe(skipToken)
    expect(adminUserOptions(authClient as never, "admin-1").queryFn).toBe(
      skipToken
    )
  })

  it("keeps mutation invalidation scoped to affected admin data", () => {
    expect(createAdminUserOptions({} as never, "admin-1").meta).toEqual({
      awaits: [adminQueryKeys.users.lists("admin-1")]
    })
    expect(
      revokeAdminUserSessionOptions({} as never, "admin-1", "user-1").meta
    ).toEqual({
      awaits: [adminQueryKeys.users.sessions("admin-1", "user-1")]
    })
  })

  it("never includes password values in keys or mutation metadata", async () => {
    const setUserPassword = vi.fn(async () => ({ data: null, error: null }))
    const reset = vi.fn()
    const options = setAdminUserPasswordOptions(
      {
        admin: { setUserPassword }
      } as never,
      reset
    )
    const password = "a-secret-that-must-not-be-cached"

    expect(options.mutationKey).toEqual(adminMutationKeys.setUserPassword)
    expect(options).not.toHaveProperty("meta")
    expect(JSON.stringify(options.mutationKey)).not.toContain(password)

    await options.mutationFn({ userId: "user-1", newPassword: password })
    options.onSettled()

    expect(setUserPassword).toHaveBeenCalledWith({
      userId: "user-1",
      newPassword: password,
      fetchOptions: { throw: true }
    })
    expect(reset).toHaveBeenCalledOnce()
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
