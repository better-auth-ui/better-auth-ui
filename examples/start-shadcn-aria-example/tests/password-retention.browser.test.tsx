import "@testing-library/jest-dom/vitest"
import { QueryClient } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { toast } from "sonner"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignUp } from "../src/components/auth/sign-up"
import { EmailFirstSignIn } from "../src/components/auth/sso/email-first-sign-in"
import { PhoneNumber } from "../src/components/auth/phone-number/phone-number"
import { ssoPlugin } from "../src/lib/auth/sso-plugin"
import { phoneNumberPlugin } from "../src/lib/auth/phone-number-plugin"

const failure = {
  status: 400,
  error: { code: "INVALID_PASSWORD", message: "Request rejected" }
}
const compromised = {
  ...failure,
  error: { code: "PASSWORD_COMPROMISED", message: "Rejected test password" }
}
const compromisedMessage = "Choose a safer password"
const passwordValue = "correct horse battery"
const clients: QueryClient[] = []
afterEach(() => {
  cleanup()
  for (const client of clients.splice(0)) client.clear()
  vi.restoreAllMocks()
  sessionStorage.clear()
})
function setup(view: "signup" | "sso" | "phone" = "signup") {
  const mutation = vi.fn(async (_params: unknown): Promise<unknown> => {
    throw failure
  })
  const discovery = vi.fn(async () => {
    throw { status: 404, message: "No provider" }
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  clients.push(queryClient)
  vi.spyOn(toast, "error").mockReturnValue("test")
  const authClient = {
    getSession: async () => null,
    signUp: { email: mutation },
    signIn: { email: mutation, phoneNumber: mutation, sso: discovery }
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  const plugins =
    view === "sso"
      ? [ssoPlugin()]
      : view === "phone"
        ? [
            phoneNumberPlugin({
              signIn: false,
              passwordSignIn: true,
              countries: ["US"]
            })
          ]
        : []
  const navigate = vi.fn()
  render(
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      plugins={plugins}
      navigate={navigate}
      Link={(props) => <a {...props} />}
      emailAndPassword={{ confirmPassword: true }}
      localization={{ auth: { passwordCompromised: compromisedMessage } }}
    >
      {view === "signup" ? (
        <SignUp />
      ) : view === "sso" ? (
        <EmailFirstSignIn />
      ) : (
        <PhoneNumber />
      )}
    </AuthProvider>
  )
  return { mutation, discovery, queryClient, navigate, user: userEvent.setup() }
}
async function settle(app: ReturnType<typeof setup>, count = 1) {
  await waitFor(() => expect(app.mutation).toHaveBeenCalledTimes(count))
  await waitFor(() => expect(app.queryClient.isMutating()).toBe(0))
}
async function fillSignUp(app: ReturnType<typeof setup>) {
  await app.user.type(screen.getByLabelText("Name", { exact: true }), "Ada")
  await app.user.type(
    screen.getByLabelText("Email", { exact: true }),
    "ada@example.com"
  )
  await app.user.type(
    screen.getByLabelText("Password", { exact: true }),
    passwordValue
  )
  await app.user.type(
    screen.getByLabelText(/^confirm password$/i, { exact: true }),
    passwordValue
  )
}
it.each([failure, compromised])(
  "preserves sign-up passwords after $error.code and clears compromised feedback on edit",
  async (error) => {
    const app = setup()
    app.mutation.mockRejectedValueOnce(error)
    await fillSignUp(app)
    await app.user.click(screen.getByRole("button", { name: "Sign Up" }))
    await settle(app)
    const password = screen.getByLabelText("Password", { exact: true })
    const confirm = screen.getByLabelText(/^confirm password$/i, {
      exact: true
    })
    expect(password).toHaveValue(passwordValue)
    expect(confirm).toHaveValue(passwordValue)
    expect(screen.queryByText("This field is required")).toBeNull()
    if (error === compromised)
      expect(screen.getByText(compromisedMessage)).toBeVisible()
    await app.user.type(password, "!")
    await app.user.type(confirm, "!")
    expect(screen.queryByText(compromisedMessage)).toBeNull()
    await app.user.click(screen.getByRole("button", { name: "Sign Up" }))
    await settle(app, 2)
    expect(app.mutation).toHaveBeenLastCalledWith(
      expect.objectContaining({ password: passwordValue + "!" })
    )
    expect(app.navigate).not.toHaveBeenCalled()
  }
)
it("replaces compromised-password feedback when an unchanged sign-up retry fails for another reason", async () => {
  const app = setup()
  app.mutation.mockRejectedValueOnce(compromised)
  await fillSignUp(app)
  const submit = screen.getByRole("button", { name: "Sign Up" })
  await app.user.click(submit)
  await settle(app)
  expect(screen.getByText(compromisedMessage)).toBeVisible()
  await app.user.click(submit)
  await settle(app, 2)
  expect(screen.queryByText(compromisedMessage)).toBeNull()
  expect(screen.getByLabelText("Password", { exact: true })).toHaveValue(
    passwordValue
  )
})
it("retains the SSO fallback password for retry and clears it when starting over", async () => {
  const app = setup("sso")
  await app.user.type(
    screen.getByLabelText("Email", { exact: true }),
    "ada@example.com"
  )
  await app.user.click(
    screen.getByRole("button", { name: /continue with email/i })
  )
  const password = await screen.findByLabelText("Password", { exact: true })
  await app.user.type(password, passwordValue)
  await app.user.click(screen.getByRole("button", { name: /sign in/i }))
  await settle(app)
  expect(password).toHaveValue(passwordValue)
  expect(screen.queryByText("This field is required")).toBeNull()
  await app.user.click(screen.getByRole("button", { name: /sign in/i }))
  await settle(app, 2)
  expect(app.mutation).toHaveBeenLastCalledWith(
    expect.objectContaining({ password: passwordValue })
  )
  await app.user.click(screen.getByRole("button", { name: /different email/i }))
  await app.user.click(
    screen.getByRole("button", { name: /continue with email/i })
  )
  expect(await screen.findByLabelText("Password", { exact: true })).toHaveValue(
    ""
  )
})
it("retains the phone sign-in password after a rejected request", async () => {
  const app = setup("phone")
  await app.user.type(
    screen.getByRole("textbox", { name: "Phone number" }),
    "2025550123"
  )
  const password = screen.getByLabelText("Password", { exact: true })
  await app.user.type(password, passwordValue)
  const submit = screen.getByRole("button", { name: /sign in/i })
  await app.user.click(submit)
  await settle(app)
  expect(password).toHaveValue(passwordValue)
  expect(screen.queryByText("This field is required")).toBeNull()
  await app.user.click(submit)
  await settle(app, 2)
  expect(app.mutation).toHaveBeenLastCalledWith(
    expect.objectContaining({
      password: passwordValue,
      phoneNumber: "+12025550123"
    })
  )
})
