import { describe, expect, it } from "vitest"
import {
  formatMemberRoles,
  hasMemberRole,
  memberRoleLabels,
  parseMemberRoles
} from "../src/plugins/organization"

describe("parseMemberRoles", () => {
  it("splits the comma-joined value Better Auth persists", () => {
    expect(parseMemberRoles("admin,member")).toEqual(["admin", "member"])
    expect(parseMemberRoles("owner")).toEqual(["owner"])
  })

  it("tolerates padding and empty entries", () => {
    expect(parseMemberRoles(" admin , , member ")).toEqual(["admin", "member"])
  })

  it("returns nothing for an absent role", () => {
    expect(parseMemberRoles(undefined)).toEqual([])
    expect(parseMemberRoles("")).toEqual([])
  })
})

describe("hasMemberRole", () => {
  it("finds a role that sits alongside others", () => {
    expect(hasMemberRole("owner,admin", "owner")).toBe(true)
    expect(hasMemberRole("admin,member", "owner")).toBe(false)
  })
})

describe("memberRoleLabels", () => {
  it("labels every role and falls back to the raw name", () => {
    expect(
      memberRoleLabels("admin,auditor", { admin: "Admin", member: "Member" })
    ).toEqual(["Admin", "auditor"])
  })
})

describe("formatMemberRoles", () => {
  it("round-trips through parseMemberRoles", () => {
    expect(parseMemberRoles(formatMemberRoles(["admin", "member"]))).toEqual([
      "admin",
      "member"
    ])
  })
})
