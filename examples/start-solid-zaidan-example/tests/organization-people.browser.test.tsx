import { type AuthClient, resolveAuthConfig } from "@better-auth-ui/core"
import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createSignal } from "solid-js"
import { OrganizationInvitations } from "../src/components/auth/organization/organization-invitations"
import { OrganizationMembers } from "../src/components/auth/organization/organization-members"

const plugin = organizationPlugin({ teams: true })
const config = resolveAuthConfig({
  authClient: {} as AuthClient,
  plugins: [plugin]
})
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
const [membersPending, setMembersPending] = createSignal(true)
const [createPermissionPending, setCreatePermissionPending] =
  createSignal(false)
const [canSelect, setCanSelect] = createSignal(true)
const mutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }

vi.mock("../src/lib/auth/organization-plugin", () => ({
  organizationPlugin: Object.assign(() => plugin, { id: "organization" })
}))

vi.mock("@better-auth-ui/solid", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@better-auth-ui/solid")>()),
  useAuth: () => config,
  useAuthPlugin: () => plugin,
  useSession: () => ({ data: { user: { id: "viewer" } } })
}))
vi.mock("@better-auth-ui/solid/plugins/organization", () => ({
  useActiveOrganization: () => ({ data: organization, isPending: false }),
  useActiveMemberRole: () => ({ data: { role: "owner" } }),
  useHasPermission: (
    _client: unknown,
    readOptions: () => {
      permissions: { invitation?: string[]; member?: string[] }
    }
  ) => {
    const create = readOptions().permissions.invitation?.includes("create")
    return {
      get data() {
        return { success: create ? false : canSelect() }
      },
      get isPending() {
        return create ? createPermissionPending() : false
      }
    }
  },
  useListOrganizationMembers: (
    _client: unknown,
    readOptions?: () => { query?: { filterField?: string } }
  ) => ({
    data: { members: [member], total: 2 },
    get isPending() {
      return readOptions?.().query?.filterField ? false : membersPending()
    }
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
  setMembersPending(true)
  setCreatePermissionPending(false)
  setCanSelect(true)
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
      render(() => <OrganizationMembers organizationId={organization.id} />)
      const table = await screen.findByRole("table", {
        name: plugin.localization.members
      })
      const count = hidden ? 3 : 5
      await waitFor(() => expectAligned(table, count))
      if (hidden) {
        expect(table.querySelector("thead")?.textContent).not.toContain(
          plugin.localization.role
        )
      }

      setMembersPending(false)
      await screen.findByText("ada@example.com")
      expectAligned(table, count)

      setCanSelect(false)
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
      setCreatePermissionPending(true)
      render(() => <OrganizationInvitations />)
      const table = await screen.findByRole("table", {
        name: plugin.localization.invitations
      })
      const count = hidden ? 3 : 6
      await waitFor(() => expectAligned(table, count))

      setCreatePermissionPending(false)
      await screen.findByText(invitation.email)
      expectAligned(table, count)

      setCanSelect(false)
      await waitFor(() => expectAligned(table, count - 1))
    }
  )
})
