import { type AuthClient, resolveAuthConfig } from "@better-auth-ui/core"
import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { InviteMemberDialog } from "../src/components/auth/organization/invite-member-dialog"

const config = resolveAuthConfig({ authClient: {} as AuthClient })
const plugin = organizationPlugin()
const organization = { id: "organization-1" }
const inviteMember = vi.fn().mockResolvedValue({})

vi.mock("../src/lib/auth/organization-plugin", () => ({
  organizationPlugin: vi.fn()
}))
vi.mock("@better-auth-ui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@better-auth-ui/react")>()),
  useAuth: () => config,
  useAuthPlugin: () => plugin
}))
vi.mock("@better-auth-ui/react/plugins/organization", () => ({
  useActiveOrganization: () => ({ data: organization }),
  useHasPermission: () => ({ data: { success: true }, isPending: false }),
  useInviteMember: () => ({ mutateAsync: inviteMember, isPending: false }),
  useListOrganizationInvitations: () => ({ data: [] }),
  useListRoles: () => ({ data: undefined }),
  useListTeams: () => ({ data: [] })
}))

beforeEach(() => inviteMember.mockClear())
afterEach(cleanup)

describe("HeroUI invitation roles", () => {
  it("adds and removes roles, retains the final role, and submits them", async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog isOpen onOpenChange={vi.fn()} />)
    await user.type(screen.getByRole("textbox"), "invitee@example.com")
    await user.click(
      screen.getByRole("button", { name: new RegExp(plugin.localization.role) })
    )
    const member = await screen.findByRole("option", {
      name: plugin.roles.member
    })
    const admin = screen.getByRole("option", { name: plugin.roles.admin })
    expect(member.getAttribute("aria-selected")).toBe("true")
    await user.click(admin)
    await waitFor(() =>
      expect(admin.getAttribute("aria-selected")).toBe("true")
    )
    expect(member.getAttribute("aria-selected")).toBe("true")
    await user.click(member)
    await waitFor(() =>
      expect(member.getAttribute("aria-selected")).toBe("false")
    )
    await user.click(admin)
    expect(admin.getAttribute("aria-selected")).toBe("true")
    await user.keyboard("{Escape}")
    await user.click(
      screen.getByRole("button", { name: plugin.localization.inviteMember })
    )
    await waitFor(() =>
      expect(inviteMember).toHaveBeenCalledWith({
        email: "invitee@example.com",
        organizationId: organization.id,
        role: ["admin"]
      })
    )
  })

  it("changes roles with the keyboard", async () => {
    const user = userEvent.setup()
    render(<InviteMemberDialog isOpen onOpenChange={vi.fn()} />)
    const trigger = screen.getByRole("button", {
      name: new RegExp(plugin.localization.role)
    })
    trigger.focus()
    await user.keyboard("{ArrowDown}")
    const member = await screen.findByRole("option", {
      name: plugin.roles.member
    })
    await waitFor(() => expect(document.activeElement).toBe(member))
    await user.keyboard("{Home}")
    const owner = screen.getByRole("option", { name: plugin.roles.owner })
    await waitFor(() => expect(document.activeElement).toBe(owner))
    await user.keyboard("{Enter}")
    await waitFor(() =>
      expect(owner.getAttribute("aria-selected")).toBe("true")
    )
    await user.keyboard(" ")
    await waitFor(() =>
      expect(owner.getAttribute("aria-selected")).toBe("false")
    )
  })
})
