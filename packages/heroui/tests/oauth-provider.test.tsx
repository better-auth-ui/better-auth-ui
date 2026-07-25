import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Auth } from "../src/components/auth/auth"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { OAuthConsent } from "../src/components/auth/oauth-provider/oauth-consent"
import { oauthProviderPlugin } from "../src/lib/auth/oauth-provider-plugin"

const session = {
  session: {
    id: "session-1",
    token: "session-token",
    userId: "user-1",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  user: {
    id: "user-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
}

function createMockAuthClient() {
  const getSession = vi.fn(async () => session)
  const publicClient = vi.fn(async () => ({
    client_id: "desktop-client",
    client_name: "Acme CLI",
    client_uri: "https://acme.example",
    logo_uri: undefined,
    policy_uri: "https://acme.example/privacy",
    tos_uri: undefined
  }))
  const consent = vi.fn(async ({ accept }) => ({
    redirect_uri: `https://acme.example/callback?accepted=${String(accept)}`
  }))

  return {
    getSession,
    oauth2: {
      consent,
      publicClient
    }
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    getSession: typeof getSession
    oauth2: {
      consent: typeof consent
      publicClient: typeof publicClient
    }
  }
}

function renderOAuthConsent(children = <OAuthConsent />) {
  const authClient = createMockAuthClient()

  return {
    authClient,
    ...render(
      <AuthProvider
        authClient={authClient}
        plugins={[oauthProviderPlugin()]}
        queryClient={createTestQueryClient()}
      >
        {children}
      </AuthProvider>
    )
  }
}

afterEach(() => {
  window.history.pushState({}, "", "/")
})

describe("oauthProviderPlugin (heroui)", () => {
  it("registers OAuthConsent as a routable auth view", () => {
    const plugin = oauthProviderPlugin()

    expect(plugin.views?.auth?.oauthConsent).toBe(OAuthConsent)
    expect(plugin.viewPaths.auth.oauthConsent).toBe("consent")
  })

  it("renders through the Auth plugin path dispatcher", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/consent?client_id=desktop-client&scope=openid%20email&sig=signed"
    )
    renderOAuthConsent(<Auth path="consent" />)

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
      "/auth/consent?client_id=desktop-client&scope=openid%20email&sig=signed"
    )
    const user = userEvent.setup()
    const { authClient } = renderOAuthConsent()

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

  it("denies the complete request without submitting a scope subset", async () => {
    window.history.pushState(
      {},
      "",
      "/auth/consent?client_id=desktop-client&scope=openid%20email&sig=signed"
    )
    const user = userEvent.setup()
    const { authClient } = renderOAuthConsent()

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
    window.history.pushState({}, "", "/auth/consent")
    const { authClient } = renderOAuthConsent()

    expect(
      await screen.findByRole("heading", {
        name: "Invalid authorization request"
      })
    ).toBeInTheDocument()
    expect(authClient.oauth2.publicClient).not.toHaveBeenCalled()
  })
})
