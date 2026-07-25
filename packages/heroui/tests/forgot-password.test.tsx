import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { ForgotPassword } from "../src/components/auth/forgot-password"

function createMockAuthClient(
  impl: () => Promise<unknown> = async () => ({ data: null, error: null })
) {
  const requestPasswordReset = vi.fn(impl)

  return {
    requestPasswordReset,
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    requestPasswordReset: typeof requestPasswordReset
  }
}

function renderForgotPassword(authClient = createMockAuthClient()) {
  const navigate = vi.fn()

  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        queryClient={
          new QueryClient({
            defaultOptions: {
              queries: { retry: false },
              mutations: { retry: false }
            }
          })
        }
      >
        <ForgotPassword />
      </AuthProvider>
    )
  }
}

describe("<ForgotPassword />", () => {
  it("offers to open the email provider after sending the reset link", async () => {
    const user = userEvent.setup()
    const { authClient, navigate } = renderForgotPassword()

    await user.type(screen.getByLabelText(/email/i), "user@gmail.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledTimes(1)
    })

    expect(authClient.requestPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@gmail.com",
        redirectTo: expect.stringContaining("/auth/reset-password"),
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )
    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toHaveAttribute("href", "https://mail.google.com/mail/")
    expect(navigate).not.toHaveBeenCalled()
  })

  it("confirms the send without a provider link for unknown domains", async () => {
    const user = userEvent.setup()
    renderForgotPassword()

    await user.type(screen.getByLabelText(/email/i), "user@internal-corp.dev")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    // The form is replaced by the email-sent view even when no provider matches.
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /send reset link/i })
      ).not.toBeInTheDocument()
    })
    expect(
      screen.queryByRole("link", { name: /open/i })
    ).not.toBeInTheDocument()

    // The sign-in footer stays available.
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument()
  })

  it("keeps the form and entered email when the request fails", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient(async () => {
      throw new Error("network down")
    })
    renderForgotPassword(authClient)

    await user.type(screen.getByLabelText(/email/i), "user@gmail.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByLabelText(/email/i)).toHaveValue("user@gmail.com")
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: /open/i })
    ).not.toBeInTheDocument()
  })
})
