import { resolveAuthConfig, type AuthClient } from "@better-auth-ui/core"
import { organizationPlugin as createOrganizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { UserButton } from "../src/components/auth/user/user-button"
import { OrganizationSwitcher } from "../src/components/auth/organization/organization-switcher"
import { TeamSwitcher } from "../src/components/auth/organization/team-switcher"
import { OrganizationTableViewOptions } from "../src/components/auth/organization/organization-table-view-options"
import { useState } from "react"
import "../src/styles/app.css"

const navigate = vi.fn()
const config = resolveAuthConfig({ authClient: {} as AuthClient, navigate })
const organizationPlugin = createOrganizationPlugin()
const activeOrganization = {
  id: "org-one",
  name: "First organization",
  slug: "first"
}
const otherOrganization = {
  id: "org-two",
  name: "Second organization",
  slug: "second"
}
const session = { user: { id: "user", name: "Ada", email: "ada@example.com" } }
const setActiveOrganization = vi.fn()
const setActiveTeam = vi.fn()

vi.mock("@better-auth-ui/react", async (original) => ({
  ...(await original<typeof import("@better-auth-ui/react")>()),
  useAuth: () => config,
  useSession: () => ({ data: session, isPending: false }),
  useAuthPlugin: () => organizationPlugin
}))
vi.mock("@better-auth-ui/react/plugins/multi-session", () => ({
  useSetActiveSession: () => ({ isPending: false })
}))
vi.mock("@better-auth-ui/react/plugins/organization", async (original) => ({
  ...(await original<
    typeof import("@better-auth-ui/react/plugins/organization")
  >()),
  useActiveOrganization: () => ({ data: activeOrganization, isPending: false }),
  useListOrganizations: () => ({
    data: [activeOrganization, otherOrganization],
    isPending: false
  }),
  useSetActiveOrganization: () => ({ mutate: setActiveOrganization }),
  useListUserTeams: () => ({
    data: [{ id: "team", name: "Engineering" }],
    isPending: false
  }),
  useSetActiveTeam: () => ({ mutate: setActiveTeam, isPending: false }),
  useListOrganizationMembers: () => ({
    data: { members: [] },
    isPending: false
  }),
  useActiveMemberRole: () => ({ data: { role: "owner" }, isPending: false }),
  useHasPermission: () => ({ data: { success: true }, isPending: false }),
  useCreateOrganization: () => ({ mutateAsync: vi.fn(), isPending: false })
}))

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe("React Aria menus", () => {
  it("navigates from the user menu with the keyboard and restores focus", async () => {
    render(<UserButton size="icon" />)
    const trigger = screen.getByRole("button", {
      name: config.localization.auth.account
    })
    trigger.focus()
    await userEvent.keyboard("{ArrowDown}")
    const settings = await screen.findByRole("menuitem", {
      name: config.localization.settings.settings
    })
    settings.focus()
    await userEvent.keyboard("{Enter}")
    expect(navigate).toHaveBeenCalledWith({
      to: `${config.basePaths.settings}/${config.viewPaths.settings.account}`
    })
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it("switches organizations from the native menu collection", async () => {
    render(<OrganizationSwitcher hideCreate />)
    await userEvent.click(
      screen.getByRole("button", { name: /First organization/ })
    )
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /Second organization/ })
    )
    expect(setActiveOrganization).toHaveBeenCalledWith({
      organizationId: otherOrganization.id
    })
  })

  it("accepts a custom team trigger and changes teams", async () => {
    const onTeamChange = vi.fn()
    render(
      <TeamSwitcher
        organizationId="org-one"
        onTeamChange={onTeamChange}
        syncSession
        trigger={<button type="button">Choose team</button>}
      />
    )
    await userEvent.click(screen.getByRole("button", { name: "Choose team" }))
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Engineering" })
    )
    expect(onTeamChange).toHaveBeenCalledWith({
      id: "team",
      name: "Engineering"
    })
    expect(setActiveTeam).toHaveBeenCalledWith({
      organizationId: "org-one",
      teamId: "team"
    })
  })

  it("toggles visible columns without closing the menu", async () => {
    function Columns() {
      const [visible, setVisible] = useState(true)
      return (
        <OrganizationTableViewOptions
          localization={organizationPlugin.localization}
          columns={[
            { id: "role", label: "Role", visible, onVisibleChange: setVisible }
          ]}
        />
      )
    }
    render(<Columns />)
    await userEvent.click(
      screen.getByRole("button", {
        name: organizationPlugin.localization.columns
      })
    )
    const role = await screen.findByRole("menuitemcheckbox", { name: "Role" })
    expect(role.getAttribute("aria-checked")).toBe("true")
    await userEvent.click(role)
    await waitFor(() => expect(role.getAttribute("aria-checked")).toBe("false"))
    expect(screen.getByRole("menu")).toBeTruthy()
  })
})
