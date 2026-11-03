import "@testing-library/jest-dom/vitest"
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
import { toast } from "@heroui/react"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { DeleteAccount } from "../src/components/auth/delete-user/delete-account"
import { deleteUserPlugin } from "../src/lib/auth/delete-user-plugin"

const failure = {
  status: 400,
  statusText: "Bad Request",
  message: "Bad Request",
  error: { code: "INVALID_PASSWORD", message: "The password is incorrect" }
}
const queryClients: QueryClient[] = []
afterEach(() => {
  cleanup()
  for (const client of queryClients.splice(0)) client.clear()
  vi.restoreAllMocks()
})

function setup(
  sendDeleteAccountVerification = false,
  error: unknown = failure
) {
  const deleteUser = vi.fn(async () => {
    throw error
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  queryClients.push(queryClient)
  const errorToast = vi.spyOn(toast, "danger").mockReturnValue("test")
  const authClient = {
    getSession: async () => ({
      user: { id: "ada", name: "Ada", email: "ada@example.com" },
      session: { id: "session" }
    }),
    listAccounts: async () => [{ providerId: "credential" }],
    deleteUser
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  const navigate = vi.fn()
  render(
    <AuthProvider
      authClient={authClient}
      queryClient={queryClient}
      navigate={navigate}
      Link={(props) => <a {...props} />}
      plugins={[deleteUserPlugin({ sendDeleteAccountVerification })]}
    >
      <DeleteAccount />
    </AuthProvider>
  )
  return { deleteUser, navigate, errorToast, user: userEvent.setup() }
}

it.each([false, true])(
  "shows one inline deletion failure and allows retry (verification email: %s)",
  async (verification) => {
    const app = setup(verification)
    const open = screen.getByRole("button", { name: "Delete account" })
    await waitFor(() => expect(open).toBeEnabled())
    await app.user.click(open)
    const dialog = await screen.findByRole("alertdialog")
    const submit = within(dialog).getByRole("button", {
      name: "Delete account"
    })
    if (!verification)
      await app.user.type(
        within(dialog).getByLabelText("Password", { exact: true }),
        "password123"
      )
    await app.user.click(submit)
    expect(await within(dialog).findByText(failure.error.message)).toBeVisible()
    expect(screen.getAllByText(failure.error.message)).toHaveLength(1)
    expect(app.errorToast).not.toHaveBeenCalled()
    expect(app.navigate).not.toHaveBeenCalled()
    expect(dialog).toBeVisible()
    if (!verification) {
      const password = within(dialog).getByLabelText("Password", {
        exact: true
      })
      expect(password).toHaveValue("password123")
      await app.user.type(password, "-corrected")
      await waitFor(() =>
        expect(within(dialog).queryByText(failure.error.message)).toBeNull()
      )
    }
    await waitFor(() => expect(submit).toBeEnabled())
    await app.user.click(submit)
    await waitFor(() => expect(app.deleteUser).toHaveBeenCalledTimes(2))
    expect(await within(dialog).findByText(failure.error.message)).toBeVisible()
    await app.user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    await app.user.click(open)
    const reopened = await screen.findByRole("alertdialog")
    expect(within(reopened).queryByText(failure.error.message)).toBeNull()
  }
)

it("preserves the reauthentication action without duplicating the server error", async () => {
  const app = setup(false, {
    ...failure,
    error: { code: "SESSION_NOT_FRESH", message: "A fresh session is required" }
  })
  const open = screen.getByRole("button", { name: "Delete account" })
  await waitFor(() => expect(open).toBeEnabled())
  await app.user.click(open)
  const dialog = await screen.findByRole("alertdialog")
  await app.user.type(
    within(dialog).getByLabelText("Password", { exact: true }),
    "password123"
  )
  await app.user.click(
    within(dialog).getByRole("button", { name: "Delete account" })
  )
  expect(
    await within(dialog).findByRole("button", { name: "Sign in again" })
  ).toBeVisible()
  expect(within(dialog).queryByText("A fresh session is required")).toBeNull()
})

it("keeps a pending deletion open and clears its failure before reopening", async () => {
  const app = setup()
  let rejectDeletion!: (reason: unknown) => void
  const pending = new Promise<never>((_resolve, reject) => {
    rejectDeletion = reject
  })
  app.deleteUser.mockImplementationOnce(() => pending)
  const open = screen.getByRole("button", { name: "Delete account" })
  await waitFor(() => expect(open).toBeEnabled())
  await app.user.click(open)
  const dialog = await screen.findByRole("alertdialog")
  const password = within(dialog).getByLabelText("Password", { exact: true })
  await app.user.type(password, "password123")
  const submit = within(dialog).getByRole("button", { name: "Delete account" })
  await app.user.click(submit)
  await waitFor(() => expect(app.deleteUser).toHaveBeenCalledOnce())
  try {
    await app.user.keyboard("{Escape}")
    expect(dialog).toBeVisible()
    expect(password).toHaveValue("password123")
  } finally {
    rejectDeletion(failure)
  }
  expect(await within(dialog).findByText(failure.error.message)).toBeVisible()
  expect(app.errorToast).not.toHaveBeenCalled()
  await app.user.click(within(dialog).getByRole("button", { name: "Cancel" }))
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  await app.user.click(open)
  await screen.findByRole("alertdialog")
  expect(screen.queryByText(failure.error.message)).toBeNull()
})
