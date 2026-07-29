import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { ResetPassword } from "../src/components/auth/reset-password"

function createMockAuthClient() {
  const resetPassword = vi.fn(async () => ({ data: null, error: null }))

  return {
    resetPassword,
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    resetPassword: typeof resetPassword
  }
}

function renderResetPassword(path: string) {
  const authClient = createMockAuthClient()
  const navigate = vi.fn()
  window.history.pushState({}, "", path)

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
        <ResetPassword />
      </AuthProvider>
    )
  }
}

afterEach(() => {
  window.history.pushState({}, "", "/")
})

describe("<ResetPassword />", () => {
  const redirectTo = "/projects/acme?tab=members"
  const encodedRedirectTo = encodeURIComponent(redirectTo)
  const signInURL = `/auth/sign-in?redirectTo=${encodedRedirectTo}`

  it("preserves the redirect target when the reset token is missing", async () => {
    const { navigate } = renderResetPassword(
      `/auth/reset-password?redirectTo=${encodedRedirectTo}`
    )

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: signInURL })
    })
  })

  it("preserves the redirect target if the token disappears before submit", async () => {
    const user = userEvent.setup()
    const { authClient, navigate } = renderResetPassword(
      `/auth/reset-password?token=reset-token&redirectTo=${encodedRedirectTo}`
    )
    window.history.pushState(
      {},
      "",
      `/auth/reset-password?redirectTo=${encodedRedirectTo}`
    )

    await user.type(screen.getByLabelText("Password"), "new-password")
    await user.click(screen.getByRole("button", { name: "Reset Password" }))

    expect(authClient.resetPassword).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith({ to: signInURL })
  })

  it("preserves the redirect target after a successful reset", async () => {
    const user = userEvent.setup()
    const { authClient, navigate } = renderResetPassword(
      `/auth/reset-password?token=reset-token&redirectTo=${encodedRedirectTo}`
    )

    await user.type(screen.getByLabelText("Password"), "new-password")
    await user.click(screen.getByRole("button", { name: "Reset Password" }))

    await waitFor(() => {
      expect(authClient.resetPassword).toHaveBeenCalledWith({
        fetchOptions: { throw: true },
        newPassword: "new-password",
        token: "reset-token"
      })
      expect(navigate).toHaveBeenCalledWith({ to: signInURL })
    })
  })
})
