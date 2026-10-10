import { cleanup, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Linking } from "react-native"
import { afterEach, expect, it, vi } from "vitest"
import { AuthorizedApplications } from "../src/components/auth/oauth-provider/authorized-applications"
import { oauthProviderLocalization } from "@better-auth-ui/core/plugins/oauth-provider"
import { OAuthConsent } from "../src/components/auth/oauth-provider/oauth-consent"
import { OrganizationActivity } from "../src/components/auth/dash/activity"
import { AnonymousButton } from "../src/components/auth/anonymous/anonymous-button"
import { anonymousPlugin } from "../src/lib/auth/anonymous-plugin"
import { oauthProviderPlugin } from "../src/lib/auth/oauth-provider-plugin"
import { dashPlugin } from "../src/lib/auth/dash-plugin"
import { organizationPlugin } from "../src/lib/auth/organization-plugin"
import { nativeApp } from "./support/native-app"
vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({ SaveFormat: { PNG: "png" } }))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it("verifies consent metadata before accepting and follows the authorized native callback", async () => {
  const query = new URLSearchParams({
    client_id: "client",
    redirect_uri: "myapp://oauth/callback",
    scope: "openid email",
    sig: "signed",
    exp: String(Math.floor(Date.now() / 1000) + 600)
  }).toString()
  const publicClientPrelogin = vi.fn(async () => ({
    client_id: "client",
    client_name: "Application"
  }))
  const consent = vi.fn(async () => ({
    url: "myapp://oauth/callback?code=code&state=state"
  }))
  const open = vi.spyOn(Linking, "openURL").mockResolvedValue(undefined)
  const app = nativeApp({
    authenticated: true,
    plugins: [oauthProviderPlugin()],
    params: { oauth_query: query },
    client: { oauth2: { publicClientPrelogin, consent } }
  })
  app.render(<OAuthConsent />)
  const allow = await screen.findByRole("button", {
    name: "Authorize",
    exact: true
  })
  await waitFor(() => expect(allow).toBeEnabled())
  expect(publicClientPrelogin).toHaveBeenCalledWith(
    expect.objectContaining({ client_id: "client", oauth_query: query })
  )
  expect(consent).not.toHaveBeenCalled()
  const user = userEvent.setup()
  await user.click(allow)
  await waitFor(() =>
    expect(consent).toHaveBeenCalledWith(
      expect.objectContaining({ accept: true, oauth_query: query })
    )
  )
  await waitFor(() =>
    expect(open).toHaveBeenCalledWith(
      "myapp://oauth/callback?code=code&state=state"
    )
  )
})
it("keeps native consent decisions visible while long permissions scroll", async () => {
  const scopes = Array.from(
    { length: 24 },
    (_, number) => `permission_${number + 1}`
  )
  const query = new URLSearchParams({
    client_id: "client",
    scope: scopes.join(" "),
    redirect_uri: "myapp://oauth/callback",
    sig: "signed"
  }).toString()
  const consent = vi.fn(async () => ({ url: "myapp://oauth/callback" }))
  const app = nativeApp({
    authenticated: true,
    plugins: [oauthProviderPlugin()],
    params: { oauth_query: query },
    client: {
      oauth2: {
        publicClientPrelogin: async () => ({
          client_id: "client",
          client_name: "Application"
        }),
        consent
      }
    }
  })
  app.render(<OAuthConsent />)
  const lastPermission = await screen.findByText(scopes.at(-1)!)
  const cancel = screen.getByRole("button", { name: "Cancel", exact: true })
  const authorize = screen.getByRole("button", {
    name: "Authorize",
    exact: true
  })
  for (const button of [cancel, authorize]) {
    const bounds = button.getBoundingClientRect()
    expect(bounds.top).toBeGreaterThanOrEqual(0)
    expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight)
  }
  const before = lastPermission.getBoundingClientRect().bottom
  lastPermission.scrollIntoView({ block: "end" })
  await waitFor(() =>
    expect(lastPermission.getBoundingClientRect().bottom).toBeLessThan(before)
  )
  expect(authorize.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    window.innerHeight
  )
  expect(consent).not.toHaveBeenCalled()
})
it("keeps activity filters mounted while resolving organization access and scopes privileged requests explicitly", async () => {
  let resolveRole!: (value: { role: string }) => void
  const role = new Promise<{ role: string }>((resolve) => {
    resolveRole = resolve
  })
  const getActiveMemberRole = vi.fn(() => role)
  const response = { events: [], total: 0, offset: 0, limit: 20 }
  const getAuditLogs = vi.fn(async () => ({ data: response, error: null }))
  const getAllAuditLogs = vi.fn(async () => ({ data: response, error: null }))
  const app = nativeApp({
    authenticated: true,
    plugins: [organizationPlugin(), dashPlugin()],
    client: {
      organization: { getActiveMemberRole },
      dash: { getAuditLogs, getAllAuditLogs }
    }
  })
  app.render(
    <OrganizationActivity organizationId="org" organizationSlug="team" />
  )
  const user = userEvent.setup()
  const identifier = screen.getByRole("textbox", {
    name: "Identifier",
    exact: true
  })
  await user.type(identifier, "Ada")
  expect(getAllAuditLogs).not.toHaveBeenCalled()
  await act(async () => resolveRole({ role: "owner" }))
  await waitFor(() =>
    expect(getAllAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org", identifier: "Ada" })
    )
  )
  expect(screen.getByRole("textbox", { name: "Identifier", exact: true })).toBe(
    identifier
  )
  expect(identifier).toHaveValue("Ada")
  expect(getAuditLogs).toHaveBeenCalledWith(
    expect.objectContaining({ organizationId: "org", userId: "user" })
  )
})
it("completes an anonymous server sign-in before navigating", async () => {
  const anonymous = vi.fn(async () => ({
    user: { id: "anonymous" },
    token: "session"
  }))
  const app = nativeApp({
    plugins: [anonymousPlugin()],
    client: { signIn: { anonymous } }
  })
  app.render(<AnonymousButton />)
  const user = userEvent.setup()
  await user.click(
    screen.getByRole("button", { name: "Continue as guest", exact: true })
  )
  await waitFor(() => expect(anonymous).toHaveBeenCalledTimes(1))
  await waitFor(() =>
    expect(app.navigation.navigate).toHaveBeenCalledWith({ to: "/" })
  )
})

it("discloses native permissions without revoking the application", async () => {
  const remove = vi.fn(async () => ({}))
  const app = nativeApp({
    authenticated: true,
    plugins: [
      oauthProviderPlugin({
        scopeMetadata: {
          custom: { label: "custom-access", description: "custom-description" }
        }
      })
    ],
    client: {
      oauth2: {
        getConsents: async () => [
          { id: "consent", clientId: "client", scopes: ["custom"] }
        ],
        publicClient: async () => ({
          client_id: "client",
          client_name: "Client"
        }),
        deleteConsent: remove
      }
    }
  })
  app.render(<AuthorizedApplications />)
  const toggle = await screen.findByRole("button", {
    name: `${oauthProviderLocalization.permissions}: Client`
  })
  expect(screen.queryByText("custom-access")).toBeNull()
  const user = userEvent.setup()
  await user.click(toggle)
  expect(await screen.findByText("custom-access")).toBeInTheDocument()
  expect(toggle).toHaveAttribute("aria-expanded", "true")
  expect(remove).not.toHaveBeenCalled()
  await user.click(toggle)
  expect(screen.queryByText("custom-access")).toBeNull()
})
