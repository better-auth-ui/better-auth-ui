import "@testing-library/jest-dom/vitest"
import { cleanup, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { DeleteAccount } from "../src/components/auth/delete-user/delete-account"
import { deleteUserPlugin } from "../src/lib/auth/delete-user-plugin"
import { toast } from "../src/primitives/toast"
import { nativeApp } from "./support/native-app"

const failure = {
  status: 400,
  statusText: "Bad Request",
  message: "Bad Request",
  error: { code: "INVALID_PASSWORD", message: "The password is incorrect" }
}
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function setup(verification = false, error: unknown = failure) {
  const deleteUser = vi.fn(async () => {
    throw error
  })
  const errorToast = vi.spyOn(toast, "danger").mockImplementation(() => {})
  const app = nativeApp({
    authenticated: true,
    plugins: [
      deleteUserPlugin({ sendDeleteAccountVerification: verification })
    ],
    client: {
      deleteUser,
      listAccounts: async () => [{ providerId: "credential" }]
    }
  })
  app.render(<DeleteAccount />)
  return { ...app, deleteUser, errorToast, user: userEvent.setup() }
}
it.each([false, true])(
  "shows one inline deletion failure and allows retry (verification email: %s)",
  async (verification) => {
    const app = setup(verification)
    const open = screen.getByRole("button", { name: "Delete account" })
    await waitFor(() => expect(open).toBeEnabled())
    await app.user.click(open)
    const heading = await screen.findByRole("heading", {
      name: "Delete account"
    })
    const dialog = heading.closest('[role="alert"]')!
    const submit = within(dialog).getByRole("button", {
      name: "Delete account"
    })
    if (!verification)
      await app.user.type(
        within(dialog).getByLabelText("Password"),
        "password123"
      )
    await app.user.click(submit)
    expect(await within(dialog).findByText(failure.error.message)).toBeVisible()
    expect(screen.getAllByText(failure.error.message)).toHaveLength(1)
    expect(app.errorToast).not.toHaveBeenCalled()
    expect(app.navigation.push).not.toHaveBeenCalled()
    if (!verification) {
      const password = within(dialog).getByLabelText("Password")
      expect(password).toHaveValue("password123")
      await app.user.type(password, "-corrected")
      expect(within(dialog).queryByText(failure.error.message)).toBeNull()
    }
    await app.user.click(submit)
    await waitFor(() => expect(app.deleteUser).toHaveBeenCalledTimes(2))
    expect(await within(dialog).findByText(failure.error.message)).toBeVisible()
    await app.user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Delete account" })
      ).toBeNull()
    )
    await app.user.click(open)
    expect(screen.queryByText(failure.error.message)).toBeNull()
  }
)
it("preserves native reauthentication recovery without duplicating the server error", async () => {
  const app = setup(false, {
    ...failure,
    error: { code: "SESSION_NOT_FRESH", message: "A fresh session is required" }
  })
  const open = screen.getByRole("button", { name: "Delete account" })
  await waitFor(() => expect(open).toBeEnabled())
  await app.user.click(open)
  const heading = await screen.findByRole("heading", { name: "Delete account" })
  const dialog = heading.closest('[role="alert"]')!
  await app.user.type(within(dialog).getByLabelText("Password"), "password123")
  await app.user.click(
    within(dialog).getByRole("button", { name: "Delete account" })
  )
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Sign in again" })).toBeVisible()
  )
  expect(screen.queryByText("A fresh session is required")).toBeNull()
  expect(app.errorToast).not.toHaveBeenCalled()
})
