import { type AuthClient, resolveAuthConfig } from "@better-auth-ui/core"
import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { OrganizationInvitations } from "../src/components/auth/organization/organization-invitations"
import { OrganizationMembers } from "../src/components/auth/organization/organization-members"

const plugin = organizationPlugin({ teams: true })
const config = resolveAuthConfig({ authClient: {} as AuthClient })
const organization = { id: "org", name: "Acme", slug: "acme" }
const member = {
  id: "member",
  organizationId: organization.id,
  role: "member",
  userId: "ada",
  user: { id: "ada", name: "Ada", email: "ada@example.com" }
}
const invitation = {
  id: "invitation",
  organizationId: organization.id,
  email: "invitee@example.com",
  role: "member",
  status: "pending",
  createdAt: new Date("2026-01-01T00:00:00Z")
}
let membersPending = true
let createPermissionPending = false
let canSelect = true
const mutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }

vi.mock("../src/lib/auth/organization-plugin", () => ({
  organizationPlugin: Object.assign(() => plugin, { id: "organization" })
}))

vi.mock("@better-auth-ui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@better-auth-ui/react")>()),
  useAuth: () => config,
  useAuthPlugin: () => plugin,
  useSession: () => ({ data: { user: { id: "viewer" } } })
}))
vi.mock("@better-auth-ui/react/plugins/organization", () => ({
  useActiveOrganization: () => ({ data: organization, isPending: false }),
  useActiveMemberRole: () => ({ data: { role: "owner" } }),
  useHasPermission: (
    _client: unknown,
    options: { permissions: { invitation?: string[]; member?: string[] } }
  ) => {
    const create = options.permissions.invitation?.includes("create")
    return {
      data: { success: create ? false : canSelect },
      isPending: create ? createPermissionPending : false
    }
  },
  useListOrganizationMembers: (
    _client: unknown,
    options?: { query?: { filterField?: string } }
  ) => ({
    data: { members: [member], total: 2 },
    isPending: options?.query?.filterField ? false : membersPending
  }),
  useListOrganizationInvitations: () => ({
    data: [invitation],
    isPending: false
  }),
  useListUserTeams: () => ({ data: [], isPending: false }),
  useListRoles: () => ({ data: undefined }),
  useListTeams: () => ({ data: [] }),
  useCancelInvitation: () => mutation,
  useInviteMember: () => mutation,
  useRemoveMember: () => mutation,
  useUpdateMemberRole: () => mutation,
  useLeaveOrganization: () => mutation
}))

beforeEach(() => {
  membersPending = true
  createPermissionPending = false
  canSelect = true
})
afterEach(() => {
  cleanup()
  window.localStorage.clear()
  window.history.replaceState({}, "", "/")
})

function expectAligned(table: Element, count: number) {
  expect(table.querySelectorAll("thead th")).toHaveLength(count)
  const rows = table.querySelectorAll("tbody tr")
  expect(rows.length).toBeGreaterThan(0)
  for (const row of rows) expect(row.children).toHaveLength(count)
}

describe("organization people columns", () => {
  it.each([false, true])(
    "keeps member columns aligned while loading and changing permissions, hidden: %s",
    async (hidden) => {
      if (hidden) {
        window.localStorage.setItem(
          "better-auth-ui:organization-table:organizationMembers:columns",
          JSON.stringify({ role: false, teams: false })
        )
      }
      const view = render(<OrganizationMembers />)
      const table = await screen.findByRole("grid", {
        name: plugin.localization.members
      })
      const count = hidden ? 3 : 5
      await waitFor(() => expectAligned(table, count))
      if (hidden) {
        expect(table.querySelector("thead")?.textContent).not.toContain(
          plugin.localization.role
        )
      }

      membersPending = false
      view.rerender(<OrganizationMembers />)
      await screen.findByText("ada@example.com")
      expectAligned(table, count)

      canSelect = false
      view.rerender(<OrganizationMembers />)
      await waitFor(() => expectAligned(table, hidden ? 2 : 3))
    }
  )

  it.each([false, true])(
    "keeps invitation permissions and loading cells aligned with hidden columns: %s",
    async (hidden) => {
      if (hidden) {
        window.localStorage.setItem(
          "better-auth-ui:organization-table:organizationInvitations:columns",
          JSON.stringify({ createdAt: false, role: false, status: false })
        )
      }
      createPermissionPending = true
      const view = render(<OrganizationInvitations />)
      const table = await screen.findByRole("grid", {
        name: plugin.localization.invitations
      })
      const count = hidden ? 3 : 6
      await waitFor(() => expectAligned(table, count))

      createPermissionPending = false
      view.rerender(<OrganizationInvitations />)
      await screen.findByText(invitation.email)
      expectAligned(table, count)

      canSelect = false
      view.rerender(<OrganizationInvitations />)
      await waitFor(() => expectAligned(table, count - 1))
    }
  )
})
