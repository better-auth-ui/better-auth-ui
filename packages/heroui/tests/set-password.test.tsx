import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { ChangePassword } from "../src/components/auth/settings/security/change-password"

/**
 * Mock client for the set-password branch of `<ChangePassword>`: a signed-in
 * user without a credential account who requests a password-reset email.
 */
function createMockAuthClient(
  requestPasswordResetImpl: () => Promise<unknown> = async () => ({
    data: null,
    error: null
  })
) {
  const requestPasswordReset = vi.fn(requestPasswordResetImpl)

  return {
    getSession: async () => ({
      user: { id: "user-1", email: "user@gmail.com", name: "User" },
      session: {}
    }),
    listAccounts: async () => [{ providerId: "google" }],
    requestPasswordReset
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    requestPasswordReset: typeof requestPasswordReset
  }
}

function renderChangePassword(authClient = createMockAuthClient()) {
  return {
    authClient,
    ...render(
      <AuthProvider
        authClient={authClient}
        basePaths={{ auth: "/login/" }}
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
        viewPaths={{ auth: { resetPassword: "/new-password/" } }}
      >
        <ChangePassword />
      </AuthProvider>
    )
  }
}

describe("<ChangePassword /> without a credential account", () => {
  it("confirms the reset email inline and offers to open the provider", async () => {
    const user = userEvent.setup()
    const { authClient } = renderChangePassword()

    await user.click(
      await screen.findByRole("button", { name: /send reset link/i })
    )

    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledTimes(1)
    })
    expect(authClient.requestPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@gmail.com",
        redirectTo: "https://example.com/login/new-password",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )

    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toHaveAttribute("href", "https://mail.google.com/mail/")
    expect(screen.getByRole("status")).toBeInTheDocument()

    // The surrounding settings card stays mounted instead of being replaced.
    expect(screen.getByRole("heading")).toBeInTheDocument()
  })

  it("keeps the send button usable when the request fails", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient(async () => {
      throw new Error("network down")
    })
    renderChangePassword(authClient)

    await user.click(
      await screen.findByRole("button", { name: /send reset link/i })
    )

    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledTimes(1)
    })

    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: /open/i })
    ).not.toBeInTheDocument()
  })
})
