import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { emailOtpPlugin } from "../src/lib/auth/email-otp-plugin"
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
  const requestPasswordResetOtp = vi.fn(async () => ({ success: true }))

  return {
    getSession: async () => ({
      user: { id: "user-1", email: "user@gmail.com", name: "User" },
      session: {}
    }),
    listAccounts: async () => [{ providerId: "google" }],
    requestPasswordReset,
    emailOtp: { requestPasswordReset: requestPasswordResetOtp }
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    requestPasswordReset: typeof requestPasswordReset
    emailOtp: { requestPasswordReset: typeof requestPasswordResetOtp }
  }
}

function renderChangePassword(
  authClient = createMockAuthClient(),
  plugins: Parameters<typeof AuthProvider>[0]["plugins"] = []
) {
  const navigate = vi.fn()
  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        basePaths={{ auth: "/login/" }}
        baseURL="https://example.com/"
        navigate={navigate}
        plugins={plugins}
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

it("uses the configured OTP reset flow for social-only password setup", async () => {
  const user = userEvent.setup()
  const { authClient, navigate } = renderChangePassword(
    createMockAuthClient(),
    [emailOtpPlugin({ passwordReset: true })]
  )
  await user.click(await screen.findByRole("button", { name: /^send code$/i }))
  await waitFor(() =>
    expect(navigate).toHaveBeenCalledWith({
      to: "/login/new-password?redirectTo=%2F"
    })
  )
  expect(authClient.emailOtp.requestPasswordReset).toHaveBeenCalledWith(
    expect.objectContaining({
      email: "user@gmail.com",
      fetchOptions: expect.objectContaining({ throw: true })
    })
  )
  expect(authClient.requestPasswordReset).not.toHaveBeenCalled()
  expect(sessionStorage.getItem("better-auth-ui.reset-password-otp")).toBe(
    "user@gmail.com"
  )
})
