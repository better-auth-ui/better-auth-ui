import { describe, expect, it } from "vitest"
import {
  organizationLocalization,
  organizationPlugin
} from "../src/plugins/organization"

describe("organizationPlugin", () => {
  it("provides direct invitation, settings, and organization paths", () => {
    const plugin = organizationPlugin()

    expect(plugin).toMatchObject({
      id: "organization",
      viewPaths: {
        auth: { acceptInvitation: "accept-invitation" },
        settings: { organizations: "organizations" },
        organization: {
          settings: "settings",
          people: "people",
          teams: "teams",
          roles: "roles"
        }
      }
    })
  })

  it("configures dynamic access control without enabling it by default", () => {
    expect(organizationPlugin().dynamicAccessControl).toBeUndefined()

    const permissions = {
      project: {
        label: "Projects",
        actions: { create: "Create", read: "Read" }
      }
    }
    const additionalFields = [
      { name: "color", label: "Color", type: "string" as const }
    ]

    expect(
      organizationPlugin({
        dynamicAccessControl: { permissions },
        modelFields: { role: additionalFields }
      }).dynamicAccessControl
    ).toEqual({ enabled: true, permissions })

    expect(
      organizationPlugin({ modelFields: { role: additionalFields } })
        .modelFields.role
    ).toEqual(additionalFields)
  })

  it("exposes team and policy controls", () => {
    const additionalFields = [
      { name: "billingCode", label: "Billing code", type: "string" as const }
    ]
    const plugin = organizationPlugin({
      modelFields: { organization: additionalFields },
      allowOrganizationCreation: false,
      invitationLimit: 5,
      membershipLimit: 20,
      organizationLimit: 2,
      teams: true
    })

    expect(plugin).toMatchObject({
      additionalFields,
      modelFields: {
        organization: additionalFields,
        member: [],
        invitation: [],
        team: [],
        role: []
      },
      allowOrganizationCreation: false,
      invitationLimit: 5,
      membershipLimit: 20,
      organizationLimit: 2,
      teams: true
    })
  })

  it("ignores invalid policy limits", () => {
    expect(
      organizationPlugin({
        invitationLimit: Number.NaN,
        membershipLimit: -1,
        organizationLimit: 1.5
      })
    ).toMatchObject({
      invitationLimit: undefined,
      membershipLimit: undefined,
      organizationLimit: undefined
    })

    expect(
      organizationPlugin({
        invitationLimit: Number.POSITIVE_INFINITY,
        membershipLimit: Number.MAX_SAFE_INTEGER + 1,
        organizationLimit: 0
      })
    ).toMatchObject({
      invitationLimit: undefined,
      membershipLimit: undefined,
      organizationLimit: 0
    })
  })

  it("normalizes static team policies", () => {
    expect(
      organizationPlugin({
        teams: {
          maximumTeams: 4,
          maximumMembersPerTeam: 12,
          allowRemovingAllTeams: true
        }
      })
    ).toMatchObject({
      teams: true,
      teamPolicy: {
        maximumTeams: 4,
        maximumMembersPerTeam: 12,
        allowRemovingAllTeams: true
      }
    })

    expect(
      organizationPlugin({
        teams: {
          enabled: false,
          maximumTeams: -1,
          maximumMembersPerTeam: Number.NaN
        }
      })
    ).toMatchObject({
      teams: false,
      teamPolicy: {
        maximumTeams: undefined,
        maximumMembersPerTeam: undefined,
        allowRemovingAllTeams: false
      }
    })
  })

  it("merges path and localization overrides", () => {
    const plugin = organizationPlugin({
      viewPaths: {
        auth: { acceptInvitation: "join" },
        settings: { organizations: "teams" },
        organization: { people: "members" }
      },
      localization: {
        acceptInvitationTitle: "Join the team"
      }
    })

    expect(plugin.viewPaths).toMatchObject({
      auth: { acceptInvitation: "join" },
      settings: { organizations: "teams" },
      organization: { settings: "settings", people: "members" }
    })
    expect(plugin.localization).toMatchObject({
      acceptInvitationTitle: "Join the team",
      invitationUnavailable: organizationLocalization.invitationUnavailable
    })
  })
})
