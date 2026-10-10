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
describe("Radix OAuth consent", () => {
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
    expect(screen.getByRole("button", { name: "Allow" })).toHaveProperty(
      "disabled",
      true
    )
    resolve({ client_id: "client", client_name: "Acme" })
    await screen.findByRole("heading", { name: "Acme" })
    expect(screen.getByText("private_scope")).toBeTruthy()
    expect(screen.getByText("https://callback.example")).toBeTruthy()
    await userEvent.click(screen.getByRole("button", { name: "Allow" }))
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
    expect(screen.queryByRole("button", { name: "Allow" })).toBeNull()
    expect(publicClient).not.toHaveBeenCalled()
  })
})
