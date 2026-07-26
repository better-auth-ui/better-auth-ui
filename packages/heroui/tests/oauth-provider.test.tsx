import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Auth } from "../src/components/auth/auth"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { AuthorizedApplications } from "../src/components/auth/oauth-provider/authorized-applications"
import { OAuthConsent } from "../src/components/auth/oauth-provider/oauth-consent"
import { OAuthSelectAccount } from "../src/components/auth/oauth-provider/oauth-select-account"
import { OAuthSignUp } from "../src/components/auth/oauth-provider/oauth-sign-up"
import { SignUp } from "../src/components/auth/sign-up"
import { oauthProviderPlugin } from "../src/lib/auth/oauth-provider-plugin"

const now = new Date()

const makeSession = (id: string, userId: string, name: string) => ({
  session: {
    id,
    token: `${id}-token`,
    userId,
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: now,
    updatedAt: now
  },
  user: {
    id: userId,
    name,
    email: `${userId}@example.com`,
    emailVerified: true,
    createdAt: now,
    updatedAt: now
  }
})

const session = makeSession("session-1", "user-1", "Ada Lovelace")
const otherSession = makeSession("session-2", "user-2", "Grace Hopper")

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
}

type ClientOverrides = {
  multiSession?: Record<string, unknown>
  oauth2?: Record<string, unknown>
}

function createMockAuthClient(overrides: ClientOverrides = {}) {
  const getSession = vi.fn(async () => session)
  const publicClient = vi.fn(async () => ({
    client_id: "desktop-client",
    client_name: "Acme CLI",
    client_uri: "https://acme.example",
    logo_uri: undefined,
    policy_uri: "https://acme.example/privacy",
    tos_uri: undefined
  }))
  const consent = vi.fn(async ({ accept }: { accept: boolean }) => ({
    redirect_uri: `https://acme.example/callback?accepted=${String(accept)}`
  }))
  const oauthContinue = vi.fn(async () => ({
    redirect: true,
    url: "https://acme.example/callback"
  }))
  const getConsents = vi.fn(async () => [])
  const deleteConsent = vi.fn(async () => undefined)
  const listDeviceSessions = vi.fn(async () => [session, otherSession])
  const setActive = vi.fn(async () => session)
  const signUpEmail = vi.fn(async () => ({}))

  return {
    getSession,
    signUp: { email: signUpEmail },
    multiSession: {
      listDeviceSessions,
      setActive,
      ...overrides.multiSession
    },
    oauth2: {
      consent,
      continue: oauthContinue,
      deleteConsent,
      getConsents,
      publicClient,
      ...overrides.oauth2
    }
  } as never
}

type MockAuthClient = ReturnType<typeof createMockAuthClient> & {
  signUp: { email: ReturnType<typeof vi.fn> }
  multiSession: {
    listDeviceSessions: ReturnType<typeof vi.fn>
    setActive: ReturnType<typeof vi.fn>
  }
  oauth2: {
    consent: ReturnType<typeof vi.fn>
    continue: ReturnType<typeof vi.fn>
    deleteConsent: ReturnType<typeof vi.fn>
    getConsents: ReturnType<typeof vi.fn>
    publicClient: ReturnType<typeof vi.fn>
  }
}

function renderWithAuth(
  children: React.ReactNode,
  {
    authClient = createMockAuthClient(),
    navigate = vi.fn(),
    plugin = oauthProviderPlugin()
  }: {
    authClient?: ReturnType<typeof createMockAuthClient>
    navigate?: (options: { to: string }) => void
    plugin?: ReturnType<typeof oauthProviderPlugin>
  } = {}
) {
  return {
    authClient: authClient as MockAuthClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        plugins={[plugin]}
        queryClient={createTestQueryClient()}
      >
        {children}
      </AuthProvider>
    )
  }
}

const submitSignUp = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Name"), "Ada Lovelace")
  await user.type(screen.getByLabelText("Email"), "ada@example.com")
  await user.type(screen.getByLabelText("Password"), "correct horse battery")
  await user.click(screen.getByRole("button", { name: "Sign Up" }))
}

afterEach(() => {
  window.history.pushState({}, "", "/")
})

describe("oauthProviderPlugin (heroui)", () => {
  it("registers sign-up, consent, account selection, and the security card", () => {
    const plugin = oauthProviderPlugin()

    expect(plugin.views?.auth?.oauthConsent).toBe(OAuthConsent)
    expect(plugin.views?.auth?.oauthSignUp).toBe(OAuthSignUp)
    expect(plugin.views?.auth?.oauthSelectAccount).toBe(OAuthSelectAccount)
    expect(plugin.securityCards).toEqual([AuthorizedApplications])
    expect(plugin.viewPaths.auth.oauthConsent).toBe("oauth-consent")
    expect(plugin.viewPaths.auth.oauthSignUp).toBe("oauth-sign-up")
    expect(plugin.viewPaths.auth.oauthSelectAccount).toBe("select-account")
  })

  it("leaves the built-in sign-up view alone", async () => {
    const plugin = oauthProviderPlugin()

    expect(plugin.views?.auth?.signUp).toBeUndefined()

    // The `Auth` dispatcher resolves plugin overrides before built-ins, so a
    // claimed `signUp` key would silently replace ordinary sign-up.
    renderWithAuth(<Auth path="sign-up" />, { plugin })

    expect(
      await screen.findByRole("button", { name: "Sign Up" })
    ).toBeInTheDocument()
  })

  it("omits the security card when connected applications are disabled", () => {
    expect(
      oauthProviderPlugin({ showConnectedApplications: false }).securityCards
    ).toBeUndefined()
  })

  it("renders through the Auth plugin path dispatcher", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/oauth-consent?client_id=desktop-client&scope=openid%20email&sig=signed"
    )
    renderWithAuth(<Auth path="oauth-consent" />)

    expect(
      await screen.findByRole("heading", { name: "Authorize Acme CLI" })
    ).toBeInTheDocument()
  })
})

describe("<OAuthConsent />", () => {
  it("shows client, scope, and account details before granting consent", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/oauth-consent?client_id=desktop-client&scope=openid%20email&sig=signed"
    )
    const user = userEvent.setup()
    const { authClient } = renderWithAuth(<OAuthConsent />)

    expect(
      await screen.findByRole("heading", { name: "Authorize Acme CLI" })
    ).toBeInTheDocument()
    expect(screen.getByText("Verify your identity")).toBeInTheDocument()
    expect(screen.getByText("View your email address")).toBeInTheDocument()
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Privacy policy" })
    ).toHaveAttribute("href", "https://acme.example/privacy")

    expect(authClient.oauth2.publicClient).toHaveBeenCalledWith({
      query: { client_id: "desktop-client" },
      fetchOptions: expect.objectContaining({ throw: true })
    })

    await user.click(screen.getByRole("button", { name: "Allow" }))

    await waitFor(() => {
      expect(authClient.oauth2.consent).toHaveBeenCalledWith({
        accept: true,
        fetchOptions: { throw: true }
      })
    })
  })

  it("resolves scope labels through the shared resolver", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/oauth-consent?client_id=desktop-client&scope=calendar%20unknown_scope&sig=signed"
    )
    renderWithAuth(<OAuthConsent />, {
      plugin: oauthProviderPlugin({
        scopeMetadata: (scope, { clientId }) =>
          scope === "calendar"
            ? { label: `Calendar for ${clientId}` }
            : undefined
      })
    })

    expect(
      await screen.findByText("Calendar for desktop-client")
    ).toBeInTheDocument()
    // An unresolved scope stays visible under its raw value.
    expect(screen.getByText("unknown_scope")).toBeInTheDocument()
  })

  it("denies the complete request without submitting a scope subset", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/oauth-consent?client_id=desktop-client&scope=openid%20email&sig=signed"
    )
    const user = userEvent.setup()
    const { authClient } = renderWithAuth(<OAuthConsent />)

    await screen.findByRole("heading", { name: "Authorize Acme CLI" })
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    await waitFor(() => {
      expect(authClient.oauth2.consent).toHaveBeenCalledWith({
        accept: false,
        fetchOptions: { throw: true }
      })
    })
  })

  it("rejects direct visits without an OAuth client ID", async () => {
    window.history.pushState({}, "", "/auth/oauth-consent")
    const { authClient } = renderWithAuth(<OAuthConsent />)

    expect(
      await screen.findByRole("heading", {
        name: "Invalid authorization request"
      })
    ).toBeInTheDocument()
    expect(authClient.oauth2.publicClient).not.toHaveBeenCalled()
  })
})

describe("<OAuthSignUp />", () => {
  it("falls back to plain sign-up on a direct visit without prompt=create", async () => {
    window.history.pushState({}, "", "/auth/oauth-sign-up")
    const user = userEvent.setup()
    const { authClient, navigate } = renderWithAuth(<OAuthSignUp />)

    await submitSignUp(user)

    await waitFor(() => expect(navigate).toHaveBeenCalled())
    expect(authClient.oauth2.continue).not.toHaveBeenCalled()
  })

  it("resumes the authorization with created after a prompt=create sign-up", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/oauth-sign-up?client_id=desktop-client&prompt=create&sig=signed"
    )
    const user = userEvent.setup()
    const { authClient, navigate } = renderWithAuth(<OAuthSignUp />)

    await submitSignUp(user)

    await waitFor(() => {
      expect(authClient.oauth2.continue).toHaveBeenCalledWith({
        created: true,
        fetchOptions: { throw: true }
      })
    })
    expect(navigate).not.toHaveBeenCalled()
  })

  it("offers a retry instead of the form when continuation fails", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/oauth-sign-up?client_id=desktop-client&prompt=create&sig=signed"
    )
    const oauthContinue = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue({ redirect: true, url: "https://acme.example" })
    const user = userEvent.setup()
    const { authClient } = renderWithAuth(<OAuthSignUp />, {
      authClient: createMockAuthClient({
        oauth2: { continue: oauthContinue }
      })
    })

    await submitSignUp(user)

    expect(
      await screen.findByRole("button", { name: "Try again" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Sign Up" })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Try again" }))

    await waitFor(() => expect(oauthContinue).toHaveBeenCalledTimes(2))
    // The account was created once — retrying never resubmits the form.
    expect(authClient.signUp.email).toHaveBeenCalledTimes(1)
  })
})

describe("<OAuthSelectAccount />", () => {
  const selectAccountUrl =
    "/auth/select-account?client_id=desktop-client&prompt=select_account&sig=signed"

  it("continues without switching when the current account is chosen", async () => {
    window.history.pushState({}, "", selectAccountUrl)
    const user = userEvent.setup()
    const { authClient } = renderWithAuth(<OAuthSelectAccount />)

    await user.click(await screen.findByText("Ada Lovelace"))

    await waitFor(() => {
      expect(authClient.oauth2.continue).toHaveBeenCalledWith({
        selected: true,
        fetchOptions: { throw: true }
      })
    })
    expect(authClient.multiSession.setActive).not.toHaveBeenCalled()
  })

  it("switches the active session before resuming for another account", async () => {
    window.history.pushState({}, "", selectAccountUrl)
    const user = userEvent.setup()
    const { authClient } = renderWithAuth(<OAuthSelectAccount />)

    await user.click(await screen.findByText("Grace Hopper"))

    await waitFor(() => {
      expect(authClient.oauth2.continue).toHaveBeenCalled()
    })
    expect(authClient.multiSession.setActive).toHaveBeenCalledWith({
      sessionToken: "session-2-token",
      fetchOptions: { throw: true }
    })
    expect(
      authClient.multiSession.setActive.mock.invocationCallOrder[0]
    ).toBeLessThan(authClient.oauth2.continue.mock.invocationCallOrder[0])
  })

  it("shows an empty state when no device sessions exist", async () => {
    window.history.pushState({}, "", selectAccountUrl)
    renderWithAuth(<OAuthSelectAccount />, {
      authClient: createMockAuthClient({
        multiSession: { listDeviceSessions: vi.fn(async () => []) }
      })
    })

    expect(await screen.findByText("No accounts available")).toBeInTheDocument()
  })

  it("rejects direct visits without an OAuth client ID", async () => {
    window.history.pushState({}, "", "/auth/select-account")
    renderWithAuth(<OAuthSelectAccount />)

    expect(
      await screen.findByRole("heading", {
        name: "Invalid authorization request"
      })
    ).toBeInTheDocument()
  })
})

describe("<AuthorizedApplications />", () => {
  const duplicateConsents = [
    {
      id: "consent-1",
      clientId: "desktop-client",
      userId: "user-1",
      scopes: ["openid"],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "consent-2",
      clientId: "desktop-client",
      userId: "user-1",
      scopes: ["email"],
      createdAt: now,
      updatedAt: now
    }
  ]

  it("renders duplicate consent records for one client as a single application", async () => {
    renderWithAuth(<AuthorizedApplications />, {
      authClient: createMockAuthClient({
        oauth2: { getConsents: vi.fn(async () => duplicateConsents) }
      })
    })

    expect(await screen.findByText("Acme CLI")).toBeInTheDocument()
    expect(screen.getAllByText("Acme CLI")).toHaveLength(1)
    expect(screen.getByText("Verify your identity")).toBeInTheDocument()
    expect(screen.getByText("View your email address")).toBeInTheDocument()
  })

  it("removes every consent record grouped under the application", async () => {
    const deleteConsent = vi.fn(async () => undefined)
    const user = userEvent.setup()
    const { authClient } = renderWithAuth(<AuthorizedApplications />, {
      authClient: createMockAuthClient({
        oauth2: {
          getConsents: vi.fn(async () => duplicateConsents),
          deleteConsent
        }
      })
    })

    await screen.findByText("Acme CLI")
    await user.click(
      screen.getByRole("button", { name: "Remove authorization" })
    )

    expect(
      await screen.findByText(
        "This application will need your approval before receiving new access. Existing tokens may remain valid until they expire."
      )
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Remove" }))

    await waitFor(() => expect(deleteConsent).toHaveBeenCalledTimes(2))
    expect(deleteConsent.mock.calls.map(([params]) => params.id)).toEqual([
      "consent-1",
      "consent-2"
    ])
    expect(authClient.oauth2.getConsents).toHaveBeenCalled()
  })

  it("shows an empty state when nothing is authorized", async () => {
    renderWithAuth(<AuthorizedApplications />)

    expect(
      await screen.findByText("No connected applications")
    ).toBeInTheDocument()
  })
})

describe("<SignUp />", () => {
  it("redirects normally when no success callback is supplied", async () => {
    const user = userEvent.setup()
    const { navigate } = renderWithAuth(<SignUp />)

    await submitSignUp(user)

    await waitFor(() => expect(navigate).toHaveBeenCalled())
  })
})
