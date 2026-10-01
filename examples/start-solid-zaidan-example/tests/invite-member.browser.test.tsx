import { type AuthClient, resolveAuthConfig } from "@better-auth-ui/core"
import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { InviteMemberDialog } from "../src/components/auth/organization/invite-member-dialog"
import "../src/styles/globals.css"

const config = resolveAuthConfig({ authClient: {} as AuthClient })
const plugin = organizationPlugin()
const organization = { id: "organization-1" }
const inviteMember = vi.fn().mockResolvedValue({})

vi.mock("@/lib/auth/organization-plugin", () => ({
  organizationPlugin: vi.fn()
}))
vi.mock("@better-auth-ui/solid", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@better-auth-ui/solid")>()),
  useAuth: () => config,
  useAuthPlugin: () => plugin
}))
vi.mock("@better-auth-ui/solid/plugins/organization", () => ({
  useActiveOrganization: () => ({ data: organization }),
  useHasPermission: () => ({ data: { success: true }, isPending: false }),
  useInviteMember: () => ({ mutateAsync: inviteMember, isPending: false }),
  useListOrganizationInvitations: () => ({ data: [] }),
  useListRoles: () => ({ data: undefined }),
  useListTeams: () => ({ data: [] })
}))

beforeEach(() => inviteMember.mockClear())
afterEach(cleanup)

describe("Solid/Zaidan invitation roles", () => {
  it("adds and removes roles, retains the final role, and submits them", async () => {
    render(() => <InviteMemberDialog open onOpenChange={vi.fn()} />)
    await userEvent.fill(screen.getByRole("textbox"), "invitee@example.com")
    const member = screen.getByRole("checkbox", { name: plugin.roles.member })
    const admin = screen.getByRole("checkbox", { name: plugin.roles.admin })
    expect(member).toHaveProperty("checked", true)
    await userEvent.click(screen.getByText(plugin.roles.admin))
    await waitFor(() => expect(admin).toHaveProperty("checked", true))
    expect(member).toHaveProperty("checked", true)
    await userEvent.click(screen.getByText(plugin.roles.member))
    await waitFor(() => expect(member).toHaveProperty("checked", false))
    await userEvent.click(screen.getByText(plugin.roles.admin))
    expect(admin).toHaveProperty("checked", true)
    await userEvent.click(
      screen.getByRole("button", { name: plugin.localization.inviteMember })
    )
    await waitFor(() =>
      expect(inviteMember).toHaveBeenCalledWith({
        email: "invitee@example.com",
        organizationId: organization.id,
        role: ["admin"],
        teamId: undefined
      })
    )
  })

  it("changes roles with the keyboard", async () => {
    render(() => <InviteMemberDialog open onOpenChange={vi.fn()} />)
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox"))
    )
    const owner = screen.getByRole("checkbox", { name: plugin.roles.owner })
    owner.focus()
    await waitFor(() => expect(document.activeElement).toBe(owner))
    await userEvent.keyboard(" ")
    await waitFor(() => expect(owner).toHaveProperty("checked", true))
    await userEvent.keyboard(" ")
    await waitFor(() => expect(owner).toHaveProperty("checked", false))
  })
})
