import { resolveAuthConfig, type AuthClient } from "@better-auth-ui/core"
import { adminPlugin as createAdminPlugin } from "@better-auth-ui/core/plugins/admin"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { AdminUsers } from "../src/components/auth/admin/admin-users"
import "../src/styles/app.css"

const auth = resolveAuthConfig({ authClient: {} as AuthClient })
const plugin = createAdminPlugin()
let permissionPending = true
vi.mock("@better-auth-ui/react", async (original) => ({
  ...(await original<typeof import("@better-auth-ui/react")>()),
  useAuth: () => auth,
  useAuthPlugin: () => plugin,
  useSession: () => ({
    data: { user: { id: "admin", role: "admin" } },
    isPending: false
  })
}))
vi.mock("@better-auth-ui/react/plugins/admin", async (original) => ({
  ...(await original<typeof import("@better-auth-ui/react/plugins/admin")>()),
  useAdminPermission: () => ({
    data: { success: true },
    isPending: permissionPending
  }),
  useAdminUsers: () => ({ data: { users: [], total: 0 }, isPending: false }),
  useAdminUser: () => ({ data: undefined, isPending: false }),
  useAdminUserSessions: () => ({ data: [], isPending: false })
}))
beforeEach(() => {
  permissionPending = true
})
afterEach(cleanup)

it("keeps named columns mounted while admin permissions load and when no users match", async () => {
  const client = new QueryClient()
  const view = render(
    <QueryClientProvider client={client}>
      <AdminUsers />
    </QueryClientProvider>
  )
  const grid = await screen.findByRole("grid", {
    name: plugin.localization.users
  })
  expect(grid.querySelectorAll("thead th")).toHaveLength(4)
  expect(grid.textContent).toContain(plugin.localization.name)
  expect(grid.querySelectorAll("tbody tr")).toHaveLength(5)
  permissionPending = false
  view.rerender(
    <QueryClientProvider client={client}>
      <AdminUsers />
    </QueryClientProvider>
  )
  await waitFor(() =>
    expect(
      screen
        .getByRole("grid", { name: plugin.localization.users })
        .querySelectorAll("tbody tr")
    ).toHaveLength(1)
  )
  expect(
    screen
      .getByRole("grid", { name: plugin.localization.users })
      .querySelectorAll("thead th")
  ).toHaveLength(4)
})
