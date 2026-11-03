import "@testing-library/jest-dom/vitest"
import { cleanup, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { SignIn } from "../src/components/auth/sign-in"
import { SignInUsername } from "../src/components/auth/username/sign-in-username"
import { usernamePlugin } from "../src/lib/auth/username-plugin"
import {
  clearPendingEmail,
  getPendingEmail,
  setPendingEmail
} from "../src/lib/pending-email"
import { toast } from "../src/primitives/toast"
import { nativeApp } from "./support/native-app"

const message = "Invalid email or password"
const failure = {
  status: 401,
  statusText: "Unauthorized",
  message: "Unauthorized",
  error: { code: "INVALID_EMAIL_OR_PASSWORD", message }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  clearPendingEmail()
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
])("native $kind sign-in errors", ({ kind, Component, label, identifier }) => {
  function setup(error: unknown = failure) {
    const email = vi.fn(async () => {
      throw error
    })
    const username = vi.fn(async () => {
      throw error
    })
    const toastError = vi.spyOn(toast, "danger").mockImplementation(() => {})
    const app = nativeApp({
      plugins: kind === "email" ? [] : [usernamePlugin()],
      client: { signIn: { email, username } }
    })
    app.render(<Component />)
    return {
      ...app,
      email,
      username,
      toastError,
      user: userEvent.setup(),
      input: screen.getByLabelText(label, { exact: true }),
      password: screen.getByLabelText("Password", { exact: true }),
      submit: screen.getByRole("button", { name: "Sign In" })
    }
  }

  it("preserves credentials and displays one inline failure without a toast, then allows retry", async () => {
    const app = setup()
    await app.user.type(app.input, identifier)
    await app.user.type(app.password, "password123")
    await app.user.click(app.submit)
    expect(await screen.findByRole("alert")).toHaveTextContent(message)
    expect(screen.getAllByText(message)).toHaveLength(1)
    expect(app.password).toHaveValue("password123")
    expect(screen.queryByText("This field is required")).toBeNull()
    expect(screen.queryByText("Unauthorized")).toBeNull()
    expect(app.toastError).not.toHaveBeenCalled()
    const request = kind === "username" ? app.username : app.email
    expect(request).toHaveBeenCalledOnce()

    await app.user.clear(app.password)
    await app.user.type(app.password, "corrected-password")
    expect(screen.queryByText(message)).toBeNull()
    await app.user.click(app.submit)
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole("alert")).toHaveTextContent(message)
    expect(app.password).toHaveValue("corrected-password")
    expect(app.toastError).not.toHaveBeenCalled()
  })

  it("rejects malformed email identifiers inline before making a request", async () => {
    const app = setup()
    await app.user.type(app.input, "test@test.com2")
    await app.user.type(app.password, "password123")
    await app.user.click(app.submit)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please enter a valid email address"
    )
    expect(app.email).not.toHaveBeenCalled()
    expect(app.username).not.toHaveBeenCalled()
    expect(app.toastError).not.toHaveBeenCalled()
  })

  it("redirects unverified accounts without an inline error or toast", async () => {
    const app = setup({
      ...failure,
      error: { code: "EMAIL_NOT_VERIFIED", message: "Verify your email" }
    })
    setPendingEmail("stale@example.com")
    await app.user.type(app.input, identifier)
    await app.user.type(app.password, "password123")
    await app.user.click(app.submit)
    await waitFor(() =>
      expect(app.navigation.push).toHaveBeenCalledWith("verifyEmail")
    )
    expect(getPendingEmail()).toBe(kind === "username" ? undefined : identifier)
    expect(screen.queryByRole("alert")).toBeNull()
    expect(app.toastError).not.toHaveBeenCalled()
  })
})
