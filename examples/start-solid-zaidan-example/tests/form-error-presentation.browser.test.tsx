import "@testing-library/jest-dom/vitest"
import { QueryClient } from "@tanstack/solid-query"
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library"
import { userEvent } from "vitest/browser"
import { afterEach, expect, it, vi } from "vitest"
import { useRequestPasswordReset } from "@better-auth-ui/solid"
import { toast } from "solid-sonner"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { ForgotPassword } from "../src/components/auth/forgot-password"
import { MagicLink } from "../src/components/auth/magic-link"
import { ForgotPasswordOtp } from "../src/components/auth/email-otp/forgot-password-otp"
import { EmailFirstSignIn } from "../src/components/auth/sso/email-first-sign-in"
import { magicLinkPlugin } from "../src/lib/auth/magic-link-plugin"
import { emailOtpPlugin } from "../src/lib/auth/email-otp-plugin"
import { ssoPlugin } from "../src/lib/auth/sso-plugin"

const failure = {
  status: 400,
  statusText: "Bad Request",
  message: "Bad Request",
  error: {
    code: "REQUEST_REJECTED",
    message: "The server rejected this request"
  }
}
const statusOnly = {
  status: 503,
  statusText: "Service Unavailable",
  message: "Service Unavailable"
}
const fallback = "Please try the request again"
const ssoFallback = "Organization sign-in is unavailable"
const noProvider = "Choose another sign-in method"
const clients: QueryClient[] = []
afterEach(() => {
  cleanup()
  for (const client of clients.splice(0)) client.clear()
  vi.restoreAllMocks()
  sessionStorage.clear()
})
type View = "forgot" | "magic" | "otp" | "sso" | "standalone"
function setup(view: View, error: unknown = failure) {
  const request = vi.fn(async (_params: unknown): Promise<unknown> => {
    throw error
  })
  const discovery = vi.fn(async (_params: unknown): Promise<unknown> => {
    throw error
  })
  const signIn = vi.fn(async (_params: unknown): Promise<unknown> => {
    throw error
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  clients.push(queryClient)
  const errorToast = vi.spyOn(toast, "error").mockReturnValue("test")
  vi.spyOn(console, "error").mockImplementation(() => {})
  const authClient = {
    getSession: async () => null,
    requestPasswordReset: request,
    emailOtp: { requestPasswordReset: request },
    signIn: { magicLink: request, sso: discovery, email: signIn }
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  const plugins = [
    magicLinkPlugin(),
    emailOtpPlugin({ passwordReset: true }),
    ssoPlugin({ localization: { ssoUnavailable: ssoFallback, noProvider } })
  ]
  const navigate = vi.fn()

  function Standalone() {
    const mutation = useRequestPasswordReset(authClient)
    return (
      <button onClick={() => mutation.mutate({ email: "ada@example.com" })}>
        Request directly
      </button>
    )
  }
  render(() => (
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      plugins={plugins}
      localization={{ errors: { generic: fallback } }}
      navigate={navigate}
      Link={(props) => <a {...props} />}
    >
      {() =>
        view === "forgot" ? (
          <ForgotPassword />
        ) : view === "magic" ? (
          <MagicLink />
        ) : view === "otp" ? (
          <ForgotPasswordOtp />
        ) : view === "sso" ? (
          <EmailFirstSignIn />
        ) : (
          <Standalone />
        )
      }
    </AuthProvider>
  ))
  return {
    request,
    discovery,
    signIn,
    queryClient,
    errorToast,
    navigate,
    user: userEvent
  }
}
const views = ["forgot", "magic", "otp"] as const
function submitName(view: (typeof views)[number]) {
  return view === "forgot"
    ? /send reset link/i
    : view === "magic"
      ? /send magic link/i
      : /send code/i
}
it.each(views)(
  "shows one inline %s failure without a toast and permits retry",
  async (view) => {
    const app = setup(view)
    const email = screen.getByLabelText("Email", { exact: true })
    await app.user.fill(email, "ada@example.com")
    const submit = screen.getByRole("button", { name: submitName(view) })
    await app.user.click(submit)
    expect(await screen.findByText(failure.error.message)).toBeVisible()
    expect(screen.getAllByText(failure.error.message)).toHaveLength(1)
    expect(app.errorToast).not.toHaveBeenCalled()
    expect(email).toHaveValue("ada@example.com")
    expect(app.navigate).not.toHaveBeenCalled()
    app.request.mockResolvedValueOnce({})
    await app.user.click(submit)
    await waitFor(() => expect(app.request).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(app.navigate).toHaveBeenCalled())
    expect(screen.queryByText(failure.error.message)).toBeNull()
  }
)
it.each(views)(
  "uses the localized inline %s fallback for status-only failures",
  async (view) => {
    const app = setup(view, statusOnly)
    await app.user.fill(
      screen.getByLabelText("Email", { exact: true }),
      "ada@example.com"
    )
    await app.user.click(screen.getByRole("button", { name: submitName(view) }))
    expect(await screen.findByText(fallback)).toBeVisible()
    expect(screen.getAllByText(fallback)).toHaveLength(1)
    expect(screen.queryByText("Service Unavailable")).toBeNull()
    expect(app.errorToast).not.toHaveBeenCalled()
  }
)
it.each([false, true])(
  "shows one SSO discovery error (status only: %s)",
  async (status) => {
    const app = setup("sso", status ? statusOnly : failure)
    await app.user.fill(
      screen.getByLabelText("Email", { exact: true }),
      "ada@example.com"
    )
    await app.user.click(
      screen.getByRole("button", { name: /continue with email/i })
    )
    const expected = status ? ssoFallback : failure.error.message
    expect(await screen.findByText(expected)).toBeVisible()
    expect(screen.getAllByText(expected)).toHaveLength(1)
    expect(screen.queryByText(noProvider)).toBeNull()
    if (!status) expect(screen.queryByText(ssoFallback)).toBeNull()
    expect(app.errorToast).not.toHaveBeenCalled()
  }
)
async function discoverFallback(app: ReturnType<typeof setup>) {
  app.discovery.mockRejectedValueOnce({
    status: 404,
    message: "No provider found"
  })
  await app.user.fill(
    screen.getByLabelText("Email", { exact: true }),
    "ada@example.com"
  )
  await app.user.click(
    screen.getByRole("button", { name: /continue with email/i })
  )
  const password = await screen.findByLabelText("Password", { exact: true })
  expect(screen.getByText(noProvider)).toBeVisible()
  expect(screen.queryByText("No provider found")).toBeNull()
  expect(app.errorToast).not.toHaveBeenCalled()
  await app.user.fill(password, "correct horse battery")
  return password
}
it("keeps expected SSO fallback silent and shows one password failure", async () => {
  const app = setup("sso")
  const password = await discoverFallback(app)
  await app.user.click(screen.getByRole("button", { name: /^sign in$/i }))
  expect(await screen.findByText(failure.error.message)).toBeVisible()
  expect(screen.getAllByText(failure.error.message)).toHaveLength(1)
  expect(password).toHaveValue("correct horse battery")
  expect(app.errorToast).not.toHaveBeenCalled()
})
it.each([false, true])(
  "redirects unverified SSO fallback without showing errors (nested code: %s)",
  async (nested) => {
    const app = setup("sso")
    await discoverFallback(app)
    const error = {
      code: "EMAIL_NOT_VERIFIED",
      message: "Verify this email first"
    }
    app.signIn.mockRejectedValueOnce(nested ? { status: 403, error } : error)
    await app.user.click(screen.getByRole("button", { name: /^sign in$/i }))
    await waitFor(() => expect(app.navigate).toHaveBeenCalled())
    expect(app.navigate).toHaveBeenCalledWith({
      to: expect.stringContaining("/auth/verify-email")
    })
    expect(screen.queryByText(error.message)).toBeNull()
    expect(app.errorToast).not.toHaveBeenCalled()
  }
)
it("preserves the standalone password-reset hook toast default", async () => {
  const app = setup("standalone")
  await app.user.click(screen.getByRole("button", { name: "Request directly" }))
  await waitFor(() => expect(app.errorToast).toHaveBeenCalledOnce())
  expect(screen.queryByText(failure.error.message)).toBeNull()
})
