import { QueryClient } from "@tanstack/react-query"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignInUsername } from "../src/components/auth/username/sign-in-username"
import { UsernameField } from "../src/components/auth/username/username-field"
import { usernamePlugin } from "../src/lib/auth/username-plugin"

// Each render gets its own QueryClient so the React Query cache doesn't
// leak across tests.
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
}

// `useDebouncer({ wait: 500 })` is real-time, so availability assertions
// need to outlast the debounce window plus the mocked mutation tick.
const DEBOUNCE_TIMEOUT = 2500

/** Sleep for `ms` while still letting React flush state updates within `act`. */
async function sleep(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })
}

// ---------------------------------------------------------------------------
// usernamePlugin (heroui) factory
// ---------------------------------------------------------------------------

describe("usernamePlugin (heroui)", () => {
  it("registers SignInUsername as the auth signIn view", () => {
    const plugin = usernamePlugin()
    expect(plugin.views?.auth?.signIn).toBe(SignInUsername)
  })

  it("registers UsernameField as the username additional field renderer", () => {
    const plugin = usernamePlugin()
    const usernameField = plugin.additionalFields?.find(
      (field) => field.name === "username"
    )
    expect(usernameField?.render).toBe(UsernameField)
  })
})

// ---------------------------------------------------------------------------
// <SignInUsername />
// ---------------------------------------------------------------------------

/**
 * Minimal `authClient` shape required by `<SignInUsername>`. The component
 * decides between `signIn.email` and `signIn.username` based on whether the
 * input looks like an email, so both surfaces are mocked.
 */
function createSignInAuthClient() {
  const username = vi.fn(async () => ({ data: {}, error: null }))
  const email = vi.fn(async () => ({ data: {}, error: null }))

  return {
    signIn: { username, email },
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    signIn: { username: typeof username; email: typeof email }
  }
}

function renderSignInUsername(authClient = createSignInAuthClient()) {
  return {
    authClient,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={() => {}}
        plugins={[usernamePlugin()]}
        queryClient={createTestQueryClient()}
      >
        <SignInUsername />
      </AuthProvider>
    )
  }
}

describe("<SignInUsername />", () => {
  it("renders the username/email and password fields", () => {
    renderSignInUsername()

    expect(screen.getByLabelText("Username")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("uses the plugin's username/email placeholder", () => {
    renderSignInUsername()

    expect(screen.getByPlaceholderText("Username or email")).toBeInTheDocument()
  })

  it("routes non-email input to authClient.signIn.username", async () => {
    const user = userEvent.setup()
    const { authClient } = renderSignInUsername()

    await user.type(screen.getByLabelText("Username"), "alice")
    await user.type(screen.getByLabelText("Password"), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(authClient.signIn.username).toHaveBeenCalledTimes(1)
    })

    expect(authClient.signIn.email).not.toHaveBeenCalled()
    expect(authClient.signIn.username).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "alice",
        password: "password123",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )
  })

  it("routes email-format input to authClient.signIn.email", async () => {
    const user = userEvent.setup()
    const { authClient } = renderSignInUsername()

    await user.type(screen.getByLabelText("Username"), "alice@example.com")
    await user.type(screen.getByLabelText("Password"), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledTimes(1)
    })

    expect(authClient.signIn.username).not.toHaveBeenCalled()
    expect(authClient.signIn.email).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "alice@example.com",
        password: "password123",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )
  })
})

// ---------------------------------------------------------------------------
// <UsernameField />
// ---------------------------------------------------------------------------

/**
 * Minimal `authClient` shape required by `<UsernameField>`. The field calls
 * `authClient.isUsernameAvailable` (debounced) when the plugin is configured
 * with `isUsernameAvailable: true`.
 */
function createUsernameFieldAuthClient(
  impl: (params: {
    username: string
  }) => Promise<{ available: boolean }> = async () => ({ available: true })
) {
  const isUsernameAvailable = vi.fn(impl)
  return {
    isUsernameAvailable,
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    isUsernameAvailable: typeof isUsernameAvailable
  }
}

function renderUsernameField(
  options: {
    authClient?: ReturnType<typeof createUsernameFieldAuthClient>
    pluginOptions?: Parameters<typeof usernamePlugin>[0]
    defaultValue?: string
  } = {}
) {
  const authClient = options.authClient ?? createUsernameFieldAuthClient()
  return {
    authClient,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={() => {}}
        plugins={[usernamePlugin(options.pluginOptions)]}
        queryClient={createTestQueryClient()}
      >
        <UsernameField
          name="username"
          field={{
            name: "username",
            type: "string",
            label: "Username",
            placeholder: "Enter your username",
            inputType: "input",
            required: true,
            defaultValue: options.defaultValue
          }}
        />
      </AuthProvider>
    )
  }
}

describe("<UsernameField />", () => {
  it("renders no availability indicator before any input", () => {
    renderUsernameField({ pluginOptions: { isUsernameAvailable: true } })

    expect(
      screen.queryByLabelText("Username is available")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/username is already taken/i)
    ).not.toBeInTheDocument()
  })

  it("seeds the input from `field.defaultValue` (user-profile case)", () => {
    renderUsernameField({
      pluginOptions: { isUsernameAvailable: true },
      defaultValue: "alice"
    })

    expect((screen.getByLabelText("Username") as HTMLInputElement).value).toBe(
      "alice"
    )
  })

  it("shows the 'available' indicator after typing a free username", async () => {
    const user = userEvent.setup()
    const { authClient } = renderUsernameField({
      authClient: createUsernameFieldAuthClient(async () => ({
        available: true
      })),
      pluginOptions: { isUsernameAvailable: true }
    })

    await user.type(screen.getByLabelText("Username"), "alice")

    await waitFor(
      () => {
        expect(authClient.isUsernameAvailable).toHaveBeenCalledTimes(1)
      },
      { timeout: DEBOUNCE_TIMEOUT }
    )

    expect(authClient.isUsernameAvailable).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "alice",
        fetchOptions: expect.objectContaining({ throw: true })
      })
    )

    await waitFor(() => {
      expect(screen.getByLabelText("Username is available")).toBeInTheDocument()
    })
  })

  it("shows the 'taken' indicator when the username is unavailable", async () => {
    const user = userEvent.setup()
    renderUsernameField({
      authClient: createUsernameFieldAuthClient(async () => ({
        available: false
      })),
      pluginOptions: { isUsernameAvailable: true }
    })

    await user.type(screen.getByLabelText("Username"), "taken")

    await waitFor(
      () => {
        expect(
          screen.getByLabelText(/username is already taken/i)
        ).toBeInTheDocument()
      },
      { timeout: DEBOUNCE_TIMEOUT }
    )
  })

  it("does not call isUsernameAvailable when the option is disabled", async () => {
    const user = userEvent.setup()
    const { authClient } = renderUsernameField({
      pluginOptions: { isUsernameAvailable: false }
    })

    await user.type(screen.getByLabelText("Username"), "alice")
    // Outlast the debounce window so we know the call would have fired.
    await sleep(700)

    expect(authClient.isUsernameAvailable).not.toHaveBeenCalled()
    expect(
      screen.queryByLabelText("Username is available")
    ).not.toBeInTheDocument()
  })

  it("skips the availability check when the value matches the user's current username", async () => {
    const user = userEvent.setup()
    const { authClient } = renderUsernameField({
      pluginOptions: { isUsernameAvailable: true },
      defaultValue: "alice"
    })

    const input = screen.getByLabelText("Username") as HTMLInputElement
    await user.click(input)
    await user.type(input, "x")
    expect(input.value).toBe("alicex")

    await waitFor(
      () => {
        expect(authClient.isUsernameAvailable).toHaveBeenCalledTimes(1)
      },
      { timeout: DEBOUNCE_TIMEOUT }
    )
    expect(authClient.isUsernameAvailable).toHaveBeenLastCalledWith(
      expect.objectContaining({ username: "alicex" })
    )

    // Revert to the original value: the suffix should disappear and no
    // additional availability check should fire.
    await user.type(input, "{Backspace}")
    expect(input.value).toBe("alice")

    await sleep(700)
    expect(authClient.isUsernameAvailable).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByLabelText("Username is available")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/username is already taken/i)
    ).not.toBeInTheDocument()
  })
})
