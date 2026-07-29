import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { ChangeEmail } from "../src/components/auth/settings/account/change-email"

function createMockAuthClient() {
  const changeEmail = vi.fn(async () => ({ data: null, error: null }))

  return {
    changeEmail,
    getSession: async () => ({
      user: { id: "user-1", email: "old@example.com", name: "User" },
      session: {}
    })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    changeEmail: typeof changeEmail
  }
}

describe("<ChangeEmail />", () => {
  it("includes the configured settings base path in its callback URL", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient()

    render(
      <AuthProvider
        authClient={authClient}
        basePaths={{ settings: "/profile/" }}
        baseURL="https://example.com/"
        navigate={() => {}}
        queryClient={
          new QueryClient({
            defaultOptions: {
              queries: { retry: false },
              mutations: { retry: false }
            }
          })
        }
        viewPaths={{ settings: { account: "/personal/" } }}
      >
        <ChangeEmail />
      </AuthProvider>
    )

    const email = await screen.findByRole("textbox", { name: /email/i })
    await user.clear(email)
    await user.type(email, "new@example.com")
    await user.click(screen.getByRole("button", { name: /update email/i }))

    await waitFor(() => {
      expect(authClient.changeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          callbackURL: "https://example.com/profile/personal",
          newEmail: "new@example.com"
        })
      )
    })
  })
})
