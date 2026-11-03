import "@testing-library/jest-dom/vitest"
import { QueryClient } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { ForgotPassword } from "../src/components/auth/forgot-password"
import { MagicLink } from "../src/components/auth/magic-link"
import { ForgotPasswordOtp } from "../src/components/auth/email-otp/forgot-password-otp"
import { EmailOtp } from "../src/components/auth/email-otp/email-otp"
import { magicLinkPlugin } from "../src/lib/auth/magic-link-plugin"
import { emailOtpPlugin } from "../src/lib/auth/email-otp-plugin"

const invalidMessage = "Enter a valid email address"
const requiredMessage = "Enter your email address"
const clients: QueryClient[] = []
afterEach(() => {
  cleanup()
  for (const client of clients.splice(0)) client.clear()
  sessionStorage.clear()
})
type View = "forgot" | "magic" | "resetOtp" | "signInOtp"
const views: View[] = ["forgot", "magic", "resetOtp", "signInOtp"]
function setup(view: View) {
  const request = vi.fn(async (_params: unknown) => ({}))
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  clients.push(queryClient)
  const authClient = {
    getSession: async () => null,
    requestPasswordReset: request,
    signIn: { magicLink: request },
    emailOtp: { requestPasswordReset: request, sendVerificationOtp: request }
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  const navigate = vi.fn()
  const plugins = [magicLinkPlugin(), emailOtpPlugin({ passwordReset: true })]

  render(
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      plugins={plugins}
      localization={{
        auth: { invalidEmail: invalidMessage, fieldRequired: requiredMessage }
      }}
      navigate={navigate}
      Link={(props) => <a {...props} />}
    >
      {view === "forgot" ? (
        <ForgotPassword />
      ) : view === "magic" ? (
        <MagicLink />
      ) : view === "resetOtp" ? (
        <ForgotPasswordOtp />
      ) : (
        <EmailOtp />
      )}
    </AuthProvider>
  )
  return { request, user: userEvent.setup() }
}
function submitName(view: View) {
  return view === "forgot"
    ? /send reset link/i
    : view === "magic"
      ? /send magic link/i
      : /send code/i
}
it.each(views)(
  "shows malformed-email feedback in %s and submits after correction",
  async (view) => {
    const app = setup(view)
    const email = screen.getByLabelText("Email", { exact: true })
    const submit = screen.getByRole("button", { name: submitName(view) })
    await app.user.type(email, "test@test.com2")
    await app.user.tab()
    expect(await screen.findByText(invalidMessage)).toBeVisible()
    expect(email).toHaveAccessibleDescription(invalidMessage)

    await app.user.click(submit)
    expect(app.request).not.toHaveBeenCalled()

    await app.user.clear(email)
    await app.user.type(email, "ada@example.com")
    await waitFor(() => expect(screen.queryByText(invalidMessage)).toBeNull())
    expect(email).not.toHaveAttribute("aria-describedby")

    await app.user.click(submit)
    await waitFor(() => expect(app.request).toHaveBeenCalledOnce())
    expect(app.request).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com" })
    )
  }
)
it.each(views)(
  "shows required-email feedback when submitting empty %s",
  async (view) => {
    const app = setup(view)
    await app.user.click(screen.getByRole("button", { name: submitName(view) }))
    expect(await screen.findByText(requiredMessage)).toBeVisible()
    expect(
      screen.getByLabelText("Email", { exact: true })
    ).toHaveAccessibleDescription(requiredMessage)

    expect(app.request).not.toHaveBeenCalled()
  }
)
