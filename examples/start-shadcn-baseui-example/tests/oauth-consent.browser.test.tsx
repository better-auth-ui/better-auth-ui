import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { AuthProvider } from "@/components/auth/auth-provider"
import { QueryClient } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { OAuthConsent } from "../src/components/auth/oauth-provider/oauth-consent"
import "@/styles/app.css"

const now = new Date()
const session = {
  session: {
    id: "session",
    token: "token",
    userId: "user",
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + 60000)
  },
  user: {
    id: "user",
    name: "Ada",
    email: "ada@example.com",
    emailVerified: true,
    createdAt: now,
    updatedAt: now
  }
}
const query =
  "?client_id=client&scope=private_scope&redirect_uri=https://callback.example/cb&sig=signed&exp=100"

afterEach(cleanup)
describe("Base UI OAuth consent", () => {
  it("keeps request details and actions unavailable until verification resolves", async () => {
    let resolve!: (value: { client_id: string; client_name: string }) => void
    const verification = new Promise<{
      client_id: string
      client_name: string
    }>((done) => {
      resolve = done
    })
    const publicClientPrelogin = vi.fn(() => verification)
    const consent = vi.fn(async () => ({
      redirect_uri: "https://callback.example/cb"
    }))
    const authClient = {
      getSession: vi.fn(async () => session),
      oauth2: { publicClientPrelogin, consent }
    } as never
    render(
      <AuthProvider
        navigate={vi.fn()}
        authClient={authClient}
        plugins={[oauthProviderPlugin()]}
        queryClient={new QueryClient()}
      >
        <OAuthConsent oauthQuery={query} />
      </AuthProvider>
    )
    await waitFor(() => expect(publicClientPrelogin).toHaveBeenCalled())
    expect(screen.queryByText("private_scope")).toBeNull()
    expect(screen.queryByText("https://callback.example")).toBeNull()
    expect(screen.getByRole("button", { name: "Authorize" })).toHaveProperty(
      "disabled",
      true
    )
    resolve({ client_id: "client", client_name: "Acme" })
    await screen.findByRole("heading", { name: "Acme" })
    expect(screen.getByText("private_scope")).toBeTruthy()
    expect(screen.getByText("https://callback.example")).toBeTruthy()
    await userEvent.click(screen.getByRole("button", { name: "Authorize" }))
    await waitFor(() =>
      expect(consent).toHaveBeenCalledWith({
        accept: true,
        oauth_query: query,
        fetchOptions: { throw: true }
      })
    )
  })

  it("fails closed when the server rejects the signed request", async () => {
    const publicClientPrelogin = vi
      .fn()
      .mockRejectedValue(new Error("Invalid signature"))
    const publicClient = vi.fn()
    const authClient = {
      getSession: vi.fn(async () => session),
      oauth2: { publicClientPrelogin, publicClient }
    } as never
    render(
      <AuthProvider
        navigate={vi.fn()}
        authClient={authClient}
        plugins={[oauthProviderPlugin()]}
        queryClient={new QueryClient()}
      >
        <OAuthConsent oauthQuery={query} />
      </AuthProvider>
    )
    await screen.findByRole("heading", {
      name: "Invalid authorization request"
    })
    expect(screen.queryByRole("button", { name: "Authorize" })).toBeNull()
    expect(publicClient).not.toHaveBeenCalled()
  })
  it("keeps both decisions visible while a long permission list scrolls", async () => {
    const scopes = Array.from(
      { length: 24 },
      (_, number) => `permission_${number + 1}`
    )
    const signedQuery = `?client_id=client&scope=${scopes.join("%20")}&redirect_uri=https://callback.example/cb&sig=signed&exp=100`
    const consent = vi.fn(async () => ({
      redirect_uri: "https://callback.example/cb"
    }))
    const authClient = {
      getSession: vi.fn(async () => session),
      oauth2: {
        publicClientPrelogin: vi.fn(async () => ({
          client_id: "client",
          client_name: "Acme"
        })),
        consent
      }
    } as never
    render(
      <AuthProvider
        navigate={vi.fn()}
        authClient={authClient}
        plugins={[oauthProviderPlugin()]}
        queryClient={new QueryClient()}
      >
        <OAuthConsent oauthQuery={signedQuery} />
      </AuthProvider>
    )
    const region = await screen.findByRole("region", { name: "Authorize Acme" })
    await screen.findByText(scopes.at(-1)!)
    const cancel = screen.getByRole("button", { name: "Cancel" })
    const authorize = screen.getByRole("button", {
      name: "Authorize"
    })
    expect(region.scrollHeight).toBeGreaterThan(region.clientHeight)
    for (const button of [cancel, authorize]) {
      const bounds = button.getBoundingClientRect()
      expect(bounds.top).toBeGreaterThanOrEqual(
        region.getBoundingClientRect().bottom
      )
      expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight)
    }
    region.focus()
    await userEvent.keyboard("{End}")
    await waitFor(() => expect(region.scrollTop).toBeGreaterThan(0))
    await userEvent.click(cancel)
    await waitFor(() =>
      expect(consent).toHaveBeenCalledWith({
        accept: false,
        oauth_query: signedQuery,
        fetchOptions: { throw: true }
      })
    )
  })
})
