import { describe, expect, it } from "vitest"
import { organizationLocalization, organizationPlugin } from "../src/plugins"

describe("organizationPlugin", () => {
  it("provides direct invitation, settings, and organization paths", () => {
    const plugin = organizationPlugin()

    expect(plugin).toMatchObject({
      id: "organization",
      viewPaths: {
        auth: { acceptInvitation: "accept-invitation" },
        settings: { organizations: "organizations" },
        organization: { settings: "settings", people: "people" }
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
