import { authQueryKeys } from "@better-auth-ui/core"
import type { AdminUser } from "@better-auth-ui/core/plugins/admin"
import "@testing-library/jest-dom/vitest"
import { QueryClient } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"

import { AdminUsers } from "../src/components/auth/admin/admin-users"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { adminPlugin } from "../src/lib/auth/admin-plugin"

afterEach(cleanup)

it("preserves the loaded admin profile through rerenders and tab switches", async () => {
  const user = userEvent.setup()
  const target: AdminUser = {
    id: "target-admin",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailVerified: true,
    role: "admin",
    banned: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01")
  }
  const session = {
    session: { id: "actor-session" },
    user: { id: "acting-admin", name: "Administrator", role: "admin" }
  }
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false }
    }
  })
  queryClient.setQueryData(authQueryKeys.session, session)
  let resolveUser!: (result: { data: AdminUser; error: null }) => void
  const userResponse = new Promise<{ data: AdminUser; error: null }>(
    (resolve) => {
      resolveUser = resolve
    }
  )
  const getUser = vi.fn(() => userResponse)
  const authClient = {
    admin: {
      getUser,
      hasPermission: vi.fn(async () => ({
        data: { success: true },
        error: null
      })),
      listUsers: vi.fn(async () => ({
        data: { users: [target], total: 1 },
        error: null
      })),
      listUserSessions: vi.fn(async () => ({
        data: { sessions: [] },
        error: null
      }))
    },
    getSession: vi.fn(async () => session)
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  const plugins = [
    adminPlugin({ allowMultipleRoles: false, defaultRole: "user" })
  ]
  const onSelectedUserIdChange = vi.fn()
  const inspector = (className: string) => (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={plugins}
      queryClient={queryClient}
    >
      <AdminUsers
        className={className}
        onSelectedUserIdChange={onSelectedUserIdChange}
        selectedUserId={target.id}
      />
    </AuthProvider>
  )
  const view = render(inspector("initial-render"))

  await waitFor(() => expect(getUser).toHaveBeenCalledOnce())
  expect(screen.queryByRole("textbox", { name: "Name" })).toBeNull()
  resolveUser({ data: target, error: null })

  const expectLoadedProfile = async () => {
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
        target.name
      )
      expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue(
        target.email
      )
      expect(
        screen.getByRole("switch", { name: "Email verified" })
      ).toBeChecked()
      expect(screen.getByRole("radio", { name: "admin" })).toBeChecked()
      expect(screen.getByRole("radio", { name: "user" })).not.toBeChecked()
    })
  }
  await expectLoadedProfile()

  // A parent update must not restore the form's original empty defaults.
  view.rerender(inspector("later-render"))
  await expectLoadedProfile()

  await user.click(screen.getByRole("tab", { name: "Sessions" }))
  await waitFor(() =>
    expect(screen.queryByRole("textbox", { name: "Name" })).toBeNull()
  )
  await user.click(screen.getByRole("tab", { name: "Overview" }))
  await expectLoadedProfile()
})
