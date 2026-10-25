import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/react-query"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { ChangePassword } from "../src/components/auth/settings/security/change-password"
import { PhoneNumberButton } from "../src/components/auth/phone-number/phone-number-button"
import { emailOtpPlugin } from "../src/lib/auth/email-otp-plugin"
import { phoneNumberPlugin } from "../src/lib/auth/phone-number-plugin"

function fixture(children: import("react").ReactNode, passwordReset = true) {
  const session = {
    user: { id: "user", email: "user@example.com", name: "User" },
    session: {}
  }
  const requestOtp = vi.fn(async () => ({ success: true }))
  const requestLink = vi.fn(async () => ({ status: true }))
  const client = {
    getSession: async () => session,
    listAccounts: async () => [{ providerId: "google" }],
    requestPasswordReset: requestLink,
    emailOtp: { requestPasswordReset: requestOtp }
  } as never
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false }
    }
  })
  queryClient.setQueryData(authQueryKeys.session, session)
  const navigate = vi.fn()
  const tree = () => (
    <AuthProvider
      authClient={client}
      queryClient={queryClient}
      navigate={navigate}
      Link={(props) => <a {...props} />}
      redirectTo="/invitation?token=abc"
      plugins={[emailOtpPlugin({ passwordReset }), phoneNumberPlugin()]}
    >
      {children}
    </AuthProvider>
  )
  render(tree())
  return { requestOtp, requestLink, navigate, queryClient }
}

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  window.history.replaceState({}, "", "/")
})

it.each([false, true])(
  "uses the configured password setup delivery (OTP: %s)",
  async (otp) => {
    const app = fixture(<ChangePassword />, otp)
    fireEvent.click(
      await screen.findByRole("button", {
        name: otp ? /^send code$/i : /send reset link/i
      })
    )
    await waitFor(() =>
      expect(otp ? app.requestOtp : app.requestLink).toHaveBeenCalledOnce()
    )
    expect(otp ? app.requestLink : app.requestOtp).not.toHaveBeenCalled()
    if (otp) {
      await waitFor(() =>
        expect(app.navigate).toHaveBeenCalledWith({
          to: "/auth/reset-password?redirectTo=%2Finvitation%3Ftoken%3Dabc"
        })
      )
      expect(sessionStorage.getItem("better-auth-ui.reset-password-otp")).toBe(
        "user@example.com"
      )
    }
    app.queryClient.clear()
  }
)

it("retains the destination when switching to phone sign-in", () => {
  const app = fixture(<PhoneNumberButton />)
  expect(screen.getByRole("link").getAttribute("href")).toBe(
    "/auth/phone-number?redirectTo=%2Finvitation%3Ftoken%3Dabc"
  )
  app.queryClient.clear()
})
