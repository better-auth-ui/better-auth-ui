import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { PasskeyButton } from "../src/components/auth/passkey/passkey-button"
import { Passkeys } from "../src/components/auth/passkey/passkeys"
import { passkeyPlugin } from "../src/lib/auth/passkey-plugin"

// Each render gets its own QueryClient so the React Query cache doesn't
// leak across tests (the default `<AuthProvider>` falls back to a
// module-level client otherwise).
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
}

// ---------------------------------------------------------------------------
// <PasskeyButton />
// ---------------------------------------------------------------------------

/**
 * Minimal `authClient` shape required by `<PasskeyButton>`. We only need
 * `signIn.passkey` — the only better-auth API the component touches.
 */
function createPasskeyButtonAuthClient() {
  const passkey = vi.fn(async () => ({ data: {}, error: null }))

  return {
    signIn: { passkey },
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    signIn: { passkey: typeof passkey }
  }
}

function renderPasskeyButton(authClient = createPasskeyButtonAuthClient()) {
  return {
    authClient,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={() => {}}
        plugins={[passkeyPlugin()]}
        queryClient={createTestQueryClient()}
      >
        <PasskeyButton />
      </AuthProvider>
    )
  }
}

describe("<PasskeyButton />", () => {
  it("renders a 'Continue with Passkey' button", () => {
    renderPasskeyButton()
    expect(
      screen.getByRole("button", { name: /continue with passkey/i })
    ).toBeInTheDocument()
  })

  it("calls authClient.signIn.passkey on click", async () => {
    const user = userEvent.setup()
    const { authClient } = renderPasskeyButton()

    await user.click(
      screen.getByRole("button", { name: /continue with passkey/i })
    )

    await waitFor(() => {
      expect(authClient.signIn.passkey).toHaveBeenCalledTimes(1)
    })

    expect(authClient.signIn.passkey).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )
  })

  it("does not render on the signUp view", () => {
    const { container } = render(
      <AuthProvider
        authClient={createPasskeyButtonAuthClient()}
        navigate={() => {}}
        plugins={[passkeyPlugin()]}
        queryClient={createTestQueryClient()}
      >
        <PasskeyButton view="signUp" />
      </AuthProvider>
    )
    expect(container).toBeEmptyDOMElement()
  })
})

// ---------------------------------------------------------------------------
// <Passkeys />
// ---------------------------------------------------------------------------

/**
 * Minimal `authClient` shape required by `<Passkeys>`. Needs
 * `passkey.listUserPasskeys`, `passkey.addPasskey`, and `passkey.deletePasskey`.
 */
function createPasskeysAuthClient(
  passkeys: { id: string; name: string | null; createdAt: Date }[] = []
) {
  const session = {
    user: { id: "user-1", email: "user@example.com" },
    session: { id: "session-1", token: "session-token" }
  }

  // Every query and mutation passes `fetchOptions: { throw: true }`, which
  // means the better-auth client unwraps `{ data, error }` and resolves
  // with `data` directly (or throws on error). The mocks mirror that.
  const getSession = vi.fn(async () => session)
  const listUserPasskeys = vi.fn(async () => passkeys)
  const addPasskey = vi.fn(async () => ({
    id: "new",
    name: null,
    createdAt: new Date()
  }))
  const deletePasskey = vi.fn(async () => ({}))

  return {
    getSession,
    passkey: { listUserPasskeys, addPasskey, deletePasskey },
    useSession: () => ({ data: session, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    getSession: typeof getSession
    passkey: {
      listUserPasskeys: typeof listUserPasskeys
      addPasskey: typeof addPasskey
      deletePasskey: typeof deletePasskey
    }
  }
}

function renderPasskeys(authClient = createPasskeysAuthClient()) {
  return {
    authClient,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={() => {}}
        plugins={[passkeyPlugin()]}
        queryClient={createTestQueryClient()}
      >
        <Passkeys />
      </AuthProvider>
    )
  }
}

describe("<Passkeys />", () => {
  it("renders the section heading and empty state copy", async () => {
    renderPasskeys()

    await waitFor(() => {
      expect(screen.getByText(/^passkeys$/i)).toBeInTheDocument()
      expect(screen.getByText(/^no passkeys$/i)).toBeInTheDocument()
      expect(
        screen.getByText(/create a passkey to securely access your account/i)
      ).toBeInTheDocument()
    })
  })

  it("renders an 'Add passkey' button", async () => {
    renderPasskeys()
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add passkey/i })
      ).toBeInTheDocument()
    })
  })

  it("opens the name dialog when the add button is clicked", async () => {
    const user = userEvent.setup()
    renderPasskeys()

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add passkey/i })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: /add passkey/i }))

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument()
  })

  it("calls addPasskey when the dialog is submitted without a name", async () => {
    const user = userEvent.setup()
    const { authClient } = renderPasskeys()

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add passkey/i })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: /add passkey/i }))

    const dialog = await screen.findByRole("alertdialog")

    await user.click(
      within(dialog).getByRole("button", { name: /add passkey/i })
    )

    await waitFor(() => {
      expect(authClient.passkey.addPasskey).toHaveBeenCalledTimes(1)
    })

    expect(authClient.passkey.addPasskey).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )

    expect(authClient.passkey.addPasskey.mock.calls[0][0]).not.toHaveProperty(
      "name"
    )
  })

  it("forwards the typed name to addPasskey", async () => {
    const user = userEvent.setup()
    const { authClient } = renderPasskeys()

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add passkey/i })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: /add passkey/i }))

    const dialog = await screen.findByRole("alertdialog")

    await user.type(
      within(dialog).getByRole("textbox", { name: /^name$/i }),
      "  My MacBook  "
    )

    await user.click(
      within(dialog).getByRole("button", { name: /add passkey/i })
    )

    await waitFor(() => {
      expect(authClient.passkey.addPasskey).toHaveBeenCalledTimes(1)
    })

    expect(authClient.passkey.addPasskey).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "My MacBook",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )
  })

  it("renders registered passkeys", async () => {
    const authClient = createPasskeysAuthClient([
      { id: "pk-1", name: "My MacBook", createdAt: new Date("2024-01-01") },
      { id: "pk-2", name: null, createdAt: new Date("2024-06-01") }
    ])
    renderPasskeys(authClient)

    await waitFor(() => {
      expect(screen.getByText("My MacBook")).toBeInTheDocument()
      // null name falls back to the "Passkey" localization string
      expect(screen.getByText("Passkey")).toBeInTheDocument()
    })
  })

  it("restores the saved passkey name after canceling a rename", async () => {
    const user = userEvent.setup()
    const authClient = createPasskeysAuthClient([
      { id: "pk-1", name: "My MacBook", createdAt: new Date("2024-01-01") }
    ])
    renderPasskeys(authClient)

    await user.click(
      await screen.findByRole("button", { name: /rename passkey/i })
    )

    const renameDialog = await screen.findByRole("alertdialog")
    const nameInput = within(renameDialog).getByRole("textbox", {
      name: /^name$/i
    })
    await user.clear(nameInput)
    await user.type(nameInput, "Work laptop")
    await user.click(
      within(renameDialog).getByRole("button", { name: /^cancel$/i })
    )

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: /rename passkey/i }))

    expect(
      within(await screen.findByRole("alertdialog")).getByRole("textbox", {
        name: /^name$/i
      })
    ).toHaveValue("My MacBook")
  })

  it("calls deletePasskey with the correct id", async () => {
    const user = userEvent.setup()
    const authClient = createPasskeysAuthClient([
      { id: "pk-1", name: "My MacBook", createdAt: new Date("2024-01-01") }
    ])
    renderPasskeys(authClient)

    await waitFor(() => {
      expect(screen.getByText("My MacBook")).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole("button", { name: /delete passkey my macbook/i })
    )

    const deleteDialog = await screen.findByRole("alertdialog")

    await user.click(
      within(deleteDialog).getByRole("button", { name: /^delete passkey$/i })
    )

    await waitFor(() => {
      expect(authClient.passkey.deletePasskey).toHaveBeenCalledTimes(1)
    })

    expect(authClient.passkey.deletePasskey).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pk-1",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )
  })

  it("gives every delete button a unique accessible name", async () => {
    const authClient = createPasskeysAuthClient([
      { id: "pk-1", name: "My MacBook", createdAt: new Date("2024-01-01") },
      { id: "pk-2", name: null, createdAt: new Date("2024-06-01") }
    ])
    renderPasskeys(authClient)

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /delete passkey my macbook/i })
      ).toBeInTheDocument()
      // The unnamed row falls back to the `passkey` localization string.
      expect(
        screen.getByRole("button", { name: /delete passkey passkey/i })
      ).toBeInTheDocument()
    })
  })
})
