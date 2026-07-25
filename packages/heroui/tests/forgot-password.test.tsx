import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { ForgotPassword } from "../src/components/auth/forgot-password"
import { ResetLinkSent } from "../src/components/auth/reset-link-sent"

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

function renderWithProvider(
  children: React.ReactNode,
  authClient = createMockAuthClient()
) {
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
        {children}
      </AuthProvider>
    )
  }
}

beforeEach(() => {
  sessionStorage.clear()
})

describe("<ForgotPassword />", () => {
  it("stores the email and redirects to the reset-link-sent view on success", async () => {
    const user = userEvent.setup()
    const { authClient, navigate } = renderWithProvider(<ForgotPassword />)

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

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: "/auth/reset-link-sent" })
    })
    expect(sessionStorage.getItem("better-auth-ui.reset-link-sent")).toBe(
      "user@gmail.com"
    )
  })

  it("keeps the form and entered email when the request fails", async () => {
    const user = userEvent.setup()
    const authClient = createMockAuthClient(async () => {
      throw new Error("network down")
    })
    const { navigate } = renderWithProvider(<ForgotPassword />, authClient)

    await user.type(screen.getByLabelText(/email/i), "user@gmail.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => {
      expect(authClient.requestPasswordReset).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByLabelText(/email/i)).toHaveValue("user@gmail.com")
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })
})

describe("<ResetLinkSent />", () => {
  it("offers to open the email provider for the stored email", async () => {
    sessionStorage.setItem("better-auth-ui.reset-link-sent", "user@gmail.com")

    renderWithProvider(<ResetLinkSent />)

    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toHaveAttribute("href", "https://mail.google.com/mail/")

    // The sign-in footer stays available.
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument()
  })

  it("still confirms the send without a provider link for unknown domains", async () => {
    sessionStorage.setItem(
      "better-auth-ui.reset-link-sent",
      "user@internal-corp.dev"
    )

    renderWithProvider(<ResetLinkSent />)

    await waitFor(() => {
      expect(
        screen.queryByRole("link", { name: /open/i })
      ).not.toBeInTheDocument()
    })
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument()
  })
})
