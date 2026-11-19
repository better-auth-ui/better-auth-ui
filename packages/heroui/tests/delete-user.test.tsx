import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { DeleteAccount } from "../src/components/auth/delete-user/delete-account"
import { deleteUserPlugin } from "../src/lib/auth/delete-user-plugin"

function createMockAuthClient() {
  const deleteUser = vi.fn<
    () => Promise<{ data: Record<string, never>; error: null }>
  >(() => Promise.resolve({ data: {}, error: null }))

  return {
    deleteUser,
    getSession: () =>
      Promise.resolve({
        session: { id: "session-1" },
        user: { id: "user-1", email: "user@example.com", name: "User" }
      }),
    listAccounts: vi.fn<() => Promise<{ providerId: string }[]>>(() =>
      Promise.resolve([{ providerId: "credential" }])
    )
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
        navigate={vi.fn<(...args: unknown[]) => void>()}
        plugins={[deleteUserPlugin()]}
      >
        <DeleteAccount />
      </AuthProvider>
    )

    const openDialog = screen.getByRole("button", { name: /delete account/iu })
    await waitFor(() => expect(openDialog).toBeEnabled())
    await user.click(openDialog)

    const dialog = await screen.findByRole("alertdialog")
    await user.click(
      within(dialog).getByRole("button", { name: /delete account/iu })
    )

    expect(
      await within(dialog).findByText("This field is required")
    ).toBeVisible()
    expect(authClient.deleteUser).not.toHaveBeenCalled()
  })
})
