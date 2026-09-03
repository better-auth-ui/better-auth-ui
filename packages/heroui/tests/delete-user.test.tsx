import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { DeleteAccount } from "../src/components/auth/delete-user/delete-account"
import { deleteUserPlugin } from "../src/lib/auth/delete-user-plugin"

function createMockAuthClient() {
  const deleteUser = vi.fn(async () => ({ data: {}, error: null }))

  return {
    deleteUser,
    getSession: async () => ({
      session: { id: "session-1" },
      user: { id: "user-1", email: "user@example.com", name: "User" }
    }),
    listAccounts: vi.fn(async () => [{ providerId: "credential" }])
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    deleteUser: typeof deleteUser
  }
}

describe("<DeleteAccount />", () => {
  it("does not delete a credential account when password is empty", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()

    render(
      <AuthProvider
        authClient={authClient}
        navigate={vi.fn()}
        plugins={[deleteUserPlugin()]}
      >
        <DeleteAccount />
      </AuthProvider>
    )

    const openDialog = screen.getByRole("button", { name: /delete account/i })
    await waitFor(() => expect(openDialog).toBeEnabled())
    await user.click(openDialog)

    const dialog = await screen.findByRole("alertdialog")
    await user.click(
      within(dialog).getByRole("button", { name: /delete account/i })
    )

    expect(
      await within(dialog).findByText("This field is required")
    ).toBeVisible()
    expect(authClient.deleteUser).not.toHaveBeenCalled()
  })
})
