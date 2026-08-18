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
          teams: "teams"
        }
      }
    })
  })

  it("exposes team and policy controls", () => {
    const additionalFields = [
      { name: "billingCode", label: "Billing code", type: "string" as const }
    ]
    const plugin = organizationPlugin({
      additionalFields,
      allowOrganizationCreation: false,
      invitationLimit: 5,
      membershipLimit: 20,
      organizationLimit: 2,
      teams: true
    })

    expect(plugin).toMatchObject({
      additionalFields,
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
