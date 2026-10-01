import { type AuthClient, resolveAuthConfig } from "@better-auth-ui/core"
import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { InviteMemberDialog } from "../src/components/auth/organization/invite-member-dialog"
import "../src/styles/app.css"

const config = resolveAuthConfig({ authClient: {} as AuthClient })
const plugin = organizationPlugin()
const organization = { id: "organization-1" }
const inviteMember = vi.fn().mockResolvedValue({})

vi.mock("@/lib/auth/organization-plugin", () => ({
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

describe("Radix invitation roles", () => {
  it("adds and removes roles without closing the menu, then submits them", async () => {
    render(<InviteMemberDialog open onOpenChange={vi.fn()} />)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "invitee@example.com" }
    })
    await userEvent.click(
      screen.getByRole("button", { name: plugin.localization.role })
    )
    const member = await screen.findByRole("menuitemcheckbox", {
      name: plugin.roles.member
    })
    const admin = screen.getByRole("menuitemcheckbox", {
      name: plugin.roles.admin
    })
    expect(member.getAttribute("aria-disabled")).toBe("true")
    await userEvent.click(admin)
    await waitFor(() => expect(admin.getAttribute("aria-checked")).toBe("true"))
    expect(member.getAttribute("aria-checked")).toBe("true")
    await userEvent.click(member)
    await waitFor(() =>
      expect(member.getAttribute("aria-checked")).toBe("false")
    )
    expect(admin.getAttribute("aria-disabled")).toBe("true")
    await userEvent.keyboard("{Escape}")
    await userEvent.click(
      await screen.findByRole("button", {
        name: plugin.localization.inviteMember
      })
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
    render(<InviteMemberDialog open onOpenChange={vi.fn()} />)
    const trigger = screen.getByRole("button", {
      name: plugin.localization.role
    })
    trigger.focus()
    await userEvent.keyboard("{ArrowDown}")
    const owner = await screen.findByRole("menuitemcheckbox", {
      name: plugin.roles.owner
    })
    await waitFor(() => expect(document.activeElement).toBe(owner))
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(owner.getAttribute("aria-checked")).toBe("true"))
    await userEvent.keyboard(" ")
    await waitFor(() =>
      expect(owner.getAttribute("aria-checked")).toBe("false")
    )
  })
})
