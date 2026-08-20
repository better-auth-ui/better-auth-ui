import { describe, expect, it } from "vitest"
import {
  formatMemberRoles,
  hasMemberRole,
  memberRoleLabels,
  membersWithRole,
  mergeOrganizationRoleLabels,
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

describe("dynamic organization roles", () => {
  it("merges dynamic role names without replacing configured labels", () => {
    expect(
      mergeOrganizationRoleLabels(
        { admin: "Administrator", auditor: "Audit team" },
        [{ role: "auditor" }, { role: "support" }]
      )
    ).toEqual({
      admin: "Administrator",
      auditor: "Audit team",
      support: "support"
    })
  })

  it("creates own labels for prototype-named dynamic roles", () => {
    const labels = mergeOrganizationRoleLabels(undefined, [
      { role: "constructor" },
      { role: "toString" }
    ])

    expect(Object.hasOwn(labels, "constructor")).toBe(true)
    expect(Object.hasOwn(labels, "toString")).toBe(true)
    expect(labels).toMatchObject({
      constructor: "constructor",
      toString: "toString"
    })
  })

  it("finds every member that holds a role in a multi-role value", () => {
    const members = [
      { id: "one", role: "admin,support" },
      { id: "two", role: "member" },
      { id: "three", role: "support" }
    ]

    expect(
      membersWithRole(members, "support").map((member) => member.id)
    ).toEqual(["one", "three"])
  })
})
