import "@testing-library/jest-dom/vitest"
import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/react-query"
import {
  cleanup,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignUp } from "../src/components/auth/sign-up"
import { ResetPassword } from "../src/components/auth/reset-password"
import { ChangePassword } from "../src/components/auth/settings/security/change-password"
import { EmailOtpFlow } from "../src/components/auth/email-otp/email-otp-flow"
import { PhoneNumberFlow } from "../src/components/auth/phone-number/phone-number-flow"
import { emailOtpPlugin } from "../src/lib/auth/email-otp-plugin"
import { phoneNumberPlugin } from "../src/lib/auth/phone-number-plugin"
import { AdminUsers } from "../src/components/auth/admin/admin-users"
import { adminPlugin } from "../src/lib/auth/admin-plugin"
import { nativeApp } from "./support/native-app"
import { toast } from "../src/primitives/toast"

vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({
  manipulateAsync: vi.fn(),
  SaveFormat: { PNG: "png" }
}))

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
})
type View =
  | "signup"
  | "reset"
  | "change"
  | "emailOtp"
  | "phoneReset"
  | "phoneSignIn"
function setup(view: View = "signup") {
  const mutation = vi.fn(async (_params: unknown): Promise<unknown> => {
    throw failure
  })
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false }
    }
  })
  clients.push(queryClient)
  const session =
    view === "change"
      ? {
          session: { id: "session", userId: "ada" },
          user: { id: "ada", email: "ada@example.com", name: "Ada" }
        }
      : null
  queryClient.setQueryData(authQueryKeys.session, session)
  vi.spyOn(toast, "danger").mockImplementation(() => {})
  vi.spyOn(toast, "success").mockImplementation(() => {})
  const authClient = {
    getSession: async () => session,
    listAccounts: async () => [{ providerId: "credential" }],
    signUp: { email: mutation },
    signIn: { phoneNumber: mutation },
    resetPassword: mutation,
    changePassword: mutation,
    emailOtp: { resetPassword: mutation },
    phoneNumber: { resetPassword: mutation }
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  const plugins = [
    emailOtpPlugin({ passwordReset: true }),
    phoneNumberPlugin({
      signIn: false,
      passwordSignIn: true,
      countries: ["US"]
    })
  ]
  const params: Record<string, string> = {
    email: "ada@example.com",
    phoneNumber: "+12025550123"
  }
  const navigation = {
    push: vi.fn(),
    navigate: vi.fn(),
    current: () => undefined,
    getParam: (key: string) => params[key],
    getPath: () => "/settings/security"
  }
  render(
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      plugins={plugins}
      navigation={navigation}
      emailAndPassword={{ confirmPassword: true }}
      localization={{ auth: { passwordCompromised: compromisedMessage } }}
    >
      {view === "signup" ? (
        <SignUp />
      ) : view === "reset" ? (
        <ResetPassword token="reset-token" />
      ) : view === "change" ? (
        <ChangePassword />
      ) : view === "emailOtp" ? (
        <EmailOtpFlow flow="reset" initiallySent />
      ) : (
        <PhoneNumberFlow
          flow={view === "phoneReset" ? "reset" : "signIn"}
          initiallySent={view === "phoneReset"}
        />
      )}
    </AuthProvider>
  )
  return { mutation, queryClient, navigation, user: userEvent.setup() }
}
async function settle(app: ReturnType<typeof setup>, count = 1) {
  await waitFor(() => expect(app.mutation).toHaveBeenCalledTimes(count))
  await waitFor(() => expect(app.queryClient.isMutating()).toBe(0))
}
it.each([failure, compromised])(
  "preserves native sign-up passwords after $error.code and clears compromised feedback on edit",
  async (error) => {
    const app = setup()
    app.mutation.mockRejectedValueOnce(error)
    await app.user.type(screen.getByLabelText("Name"), "Ada")
    await app.user.type(screen.getByLabelText("Email"), "ada@example.com")
    const password = screen.getByLabelText("Password", { exact: true })
    const confirm = screen.getByLabelText(/^confirm password$/i)
    await app.user.type(password, passwordValue)
    await app.user.type(confirm, passwordValue)
    await app.user.click(screen.getByRole("button", { name: "Sign Up" }))
    await settle(app)
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
  }
)
it.each(["reset", "change", "emailOtp", "phoneReset"] as const)(
  "retains %s passwords for ordinary and compromised failures, then retries successfully",
  async (view) => {
    const app = setup(view)
    const password = await screen.findByLabelText(
      view === "phoneReset" ? /^password$/i : /^new password$/i
    )
    const confirm = screen.getByLabelText(/^confirm password$/i)
    const current =
      view === "change"
        ? screen.getByLabelText(/^current password$/i)
        : undefined
    if (current) {
      await waitFor(() =>
        expect(current).not.toHaveAttribute("aria-disabled", "true")
      )
      await app.user.type(current, "old password")
    }
    await app.user.type(password, passwordValue)
    await app.user.type(confirm, passwordValue)
    const code =
      view === "emailOtp" || view === "phoneReset"
        ? screen.getByLabelText(
            view === "emailOtp" ? /^code$/i : /^phone code$/i
          )
        : undefined
    const submit = screen.getByRole("button", {
      name: view === "change" ? /update password/i : /reset password/i
    })
    for (const [index, error] of [failure, compromised].entries()) {
      app.mutation.mockRejectedValueOnce(error)
      if (code) await app.user.type(code, "123456")
      await app.user.click(submit)
      await settle(app, index + 1)
      expect(password).toHaveValue(passwordValue)
      expect(confirm).toHaveValue(passwordValue)
      if (current) expect(current).toHaveValue("old password")
      if (code) expect(code).toHaveValue("")
      if (error === compromised)
        expect(screen.getByText(compromisedMessage)).toBeVisible()
    }
    await app.user.type(password, "!")
    await app.user.type(confirm, "!")
    expect(screen.queryByText(compromisedMessage)).toBeNull()
    app.mutation.mockResolvedValueOnce({})
    if (code) await app.user.type(code, "654321")
    await app.user.click(submit)
    await settle(app, 3)
    const submittedPassword = view === "emailOtp" ? "password" : "newPassword"
    expect(app.mutation).toHaveBeenLastCalledWith(
      expect.objectContaining({ [submittedPassword]: passwordValue + "!" })
    )
    if (view === "change") {
      expect(password).toHaveValue("")
      expect(confirm).toHaveValue("")
      expect(current).toHaveValue("")
    } else expect(app.navigation.push).toHaveBeenCalled()
  }
)
it("retains a native phone sign-in password after a rejected request", async () => {
  const app = setup("phoneSignIn")
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

it("retains an admin password change for retry and closes it on success", async () => {
  const setUserPassword = vi.fn(async (_params: unknown): Promise<unknown> => {
    throw failure
  })
  const target = {
    id: "other",
    name: "Grace",
    email: "grace@example.com",
    role: "user",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    banned: false
  }
  const app = nativeApp({
    authenticated: true,
    plugins: [adminPlugin()],
    client: {
      admin: {
        hasPermission: async () => ({ data: { success: true }, error: null }),
        listUsers: async () => ({
          data: { users: [target], total: 1 },
          error: null
        }),
        getUser: async () => ({ data: target, error: null }),
        listUserSessions: async () => ({ data: { sessions: [] }, error: null }),
        setUserPassword
      }
    }
  })
  clients.push(app.queryClient)
  app.render(<AdminUsers />)
  const user = userEvent.setup({ delay: 20 })
  await user.click(await screen.findByRole("button", { name: "User details" }))
  await user.click(await screen.findByRole("button", { name: "Set password" }))
  const heading = await screen.findByRole("heading", { name: "Set password" })
  await waitFor(() =>
    expect(screen.getByRole("dialog")).toContainElement(heading)
  )
  const dialog = heading.closest('[role="alert"]')!
  const password = within(dialog).getByLabelText("Password", { exact: true })
  await user.type(password, passwordValue)
  const submit = within(dialog).getByRole("button", { name: "Set password" })
  await user.click(submit)
  expect(await within(dialog).findByText(failure.error.message)).toBeVisible()
  expect(password).toHaveValue(passwordValue)
  setUserPassword.mockResolvedValueOnce({})
  await user.click(submit)
  await waitFor(() => expect(setUserPassword).toHaveBeenCalledTimes(2))
  expect(setUserPassword).toHaveBeenLastCalledWith(
    expect.objectContaining({ userId: "other", newPassword: passwordValue })
  )
  await waitFor(() =>
    expect(screen.queryByRole("heading", { name: "Set password" })).toBeNull()
  )
})
