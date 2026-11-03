import "@testing-library/jest-dom/vitest"
import { authQueryKeys } from "@better-auth-ui/core"
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import { useSignInEmail } from "@better-auth-ui/react"
import { useSignInUsername } from "@better-auth-ui/react/plugins/username"
import { QueryClient } from "@tanstack/react-query"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { toast } from "@heroui/react"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignIn } from "../src/components/auth/sign-in"
import { SignInUsername } from "../src/components/auth/username/sign-in-username"
import { usernamePlugin } from "../src/lib/auth/username-plugin"

const message = "Invalid email or password"
const failure = {
  status: 401,
  statusText: "Unauthorized",
  message: "Unauthorized",
  error: { code: "INVALID_EMAIL_OR_PASSWORD", message }
}

it.each(["email", "username"])(
  "keeps standalone %s sign-in hook failures as toasts",
  async (kind) => {
    const toastError = vi.spyOn(toast, "danger").mockReturnValue("test")
    const reject = vi.fn(async () => {
      throw failure
    })
    const authClient = {
      getSession: async () => null,
      signIn: { email: reject, username: reject }
    } as unknown as UsernameAuthClient
    const queryClient = new QueryClient()
    function StandaloneSignIn() {
      const email = useSignInEmail(authClient)
      const username = useSignInUsername(authClient)
      return (
        <button
          onClick={() => {
            if (kind === "email") {
              email.mutate({
                email: "ada@example.com",
                password: "password123"
              })
            } else {
              username.mutate({ username: "ada", password: "password123" })
            }
          }}
        >
          Attempt sign-in
        </button>
      )
    }
    render(
      <AuthProvider
        authClient={authClient}
        queryClient={queryClient}
        navigate={vi.fn()}
      >
        <StandaloneSignIn />
      </AuthProvider>
    )
    fireEvent.click(screen.getByRole("button", { name: "Attempt sign-in" }))
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledExactlyOnceWith(message)
    )
  }
)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  sessionStorage.clear()
  window.history.replaceState({}, "", "/")
})

describe.each([
  {
    kind: "email",
    Component: SignIn,
    label: "Email",
    identifier: "ada@example.com"
  },
  {
    kind: "username/email",
    Component: SignInUsername,
    label: "Username",
    identifier: "ada@example.com"
  },
  {
    kind: "username",
    Component: SignInUsername,
    label: "Username",
    identifier: "ada"
  }
])("$kind sign-in errors", ({ kind, Component, label, identifier }) => {
  function setup(error: unknown = failure) {
    const email = vi.fn(async () => {
      throw error
    })
    const username = vi.fn(async () => {
      throw error
    })
    const navigate = vi.fn()
    const toastError = vi.spyOn(toast, "danger").mockReturnValue("test")
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    })
    const authClient = {
      getSession: async () => null,
      signIn: { email, username }
    } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
    const view = render(
      <AuthProvider
        authClient={authClient}
        queryClient={queryClient}
        navigate={navigate}
        redirectTo="/dashboard"
        plugins={kind === "email" ? [] : [usernamePlugin()]}
      >
        <Component />
      </AuthProvider>
    )
    const input = screen.getByLabelText(label, { exact: true })
    const password = screen.getByLabelText("Password", { exact: true })
    const submit = screen.getByRole("button", { name: "Sign In" })
    return {
      ...view,
      email,
      username,
      navigate,
      toastError,
      queryClient,
      input,
      password,
      submit
    }
  }

  it("preserves credentials and displays one inline failure without a toast, then allows retry", async () => {
    const app = setup()
    fireEvent.change(app.input, { target: { value: identifier } })
    fireEvent.change(app.password, { target: { value: "password123" } })
    fireEvent.click(app.submit)
    expect(await screen.findByText(message)).toBeVisible()
    expect(
      within(app.container.querySelector("form")!).getByText(message)
    ).toBeVisible()
    expect(screen.getAllByText(message)).toHaveLength(1)
    expect(app.password).toHaveValue("password123")
    expect(screen.queryByText("This field is required")).toBeNull()
    expect(screen.queryByText("Unauthorized")).toBeNull()
    expect(app.toastError).not.toHaveBeenCalled()
    const request = kind === "username" ? app.username : app.email
    expect(request).toHaveBeenCalledOnce()
    expect(app.queryClient.getMutationCache().getAll()[0]?.meta).toMatchObject({
      awaits: [authQueryKeys.session],
      errorPresentation: "inline"
    })

    fireEvent.change(app.password, { target: { value: "corrected-password" } })
    await waitFor(() => expect(screen.queryByText(message)).toBeNull())
    await waitFor(() => expect(app.submit).toBeEnabled())
    fireEvent.click(app.submit)
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    expect(await screen.findByText(message)).toBeVisible()
    expect(app.password).toHaveValue("corrected-password")
    expect(app.toastError).not.toHaveBeenCalled()
  })

  it("rejects malformed email identifiers inline before making a request", async () => {
    const app = setup()
    fireEvent.change(app.input, { target: { value: "test@test.com2" } })
    fireEvent.change(app.password, { target: { value: "password123" } })
    fireEvent.click(app.submit)
    expect(
      await screen.findByText("Please enter a valid email address")
    ).toBeVisible()
    expect(app.email).not.toHaveBeenCalled()
    expect(app.username).not.toHaveBeenCalled()
    expect(app.password).toHaveValue("password123")
    expect(app.toastError).not.toHaveBeenCalled()
  })

  it("redirects unverified accounts without showing an inline error or toast", async () => {
    const app = setup({
      ...failure,
      error: { code: "EMAIL_NOT_VERIFIED", message: "Verify your email" }
    })
    sessionStorage.setItem("better-auth-ui.verify-email", "stale@example.com")
    fireEvent.change(app.input, { target: { value: identifier } })
    fireEvent.change(app.password, { target: { value: "password123" } })
    fireEvent.click(app.submit)
    await waitFor(() =>
      expect(app.navigate).toHaveBeenCalledWith({
        to: "/auth/verify-email?redirectTo=%2Fdashboard"
      })
    )
    expect(sessionStorage.getItem("better-auth-ui.verify-email")).toBe(
      kind === "username" ? null : identifier
    )
    expect(screen.queryByText("Verify your email")).toBeNull()
    expect(screen.queryByText("Unauthorized")).toBeNull()
    expect(app.toastError).not.toHaveBeenCalled()
  })
})
