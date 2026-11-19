import { AuthProvider } from "../src/components/auth/auth-provider"
import { AgentApproval } from "../src/components/auth/agent-auth/agent-approval"
import { AuthorizedApplication } from "../src/components/auth/oauth-provider/authorized-application"
import { agentAuthPlugin } from "../src/lib/auth/agent-auth-plugin"
import { oauthProviderPlugin } from "../src/lib/auth/oauth-provider-plugin"
import { agentAuthLocalization } from "@better-auth-ui/core/plugins/agent-auth"
import { oauthProviderLocalization } from "@better-auth-ui/core/plugins/oauth-provider"
import { QueryClient } from "@tanstack/react-query"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, assert, expect, it, vi } from "vitest"
import { userEvent as user } from "vitest/browser"
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

afterEach(() => {
  cleanup()
  window.history.replaceState({}, "", "/")
})
it("preserves capability selection when limits are opened", async () => {
  window.history.replaceState({}, "", "/auth/agent?agent_id=agent")
  const capabilities = Array.from({ length: 24 }, (_, number) => ({
    capability: `capability_${number + 1}`,
    status: "pending",
    approvalStrength: "session",
    constraints: { maxItems: number + 1 }
  }))
  const [firstGrant] = capabilities
  assert.exists(firstGrant)
  const approve = vi.fn<() => Promise<void>>(async () => {})
  const adapter = {
    getApproval: () =>
      Promise.resolve({
        id: "agent",
        name: "Agent",
        hostId: "host",
        mode: "delegated",
        status: "pending",
        createdAt: now,
        grants: capabilities,
        requestedCapabilities: capabilities
      }),
    approve,
    deny: vi.fn<() => Promise<void>>(async () => {}),
    listAgents: () => Promise.resolve([]),
    revoke: async () => {}
  } as never
  const authClient = { getSession: () => Promise.resolve(session) } as never
  render(
    <AuthProvider
      authClient={authClient}
      navigate={vi.fn<(...args: unknown[]) => void>()}
      plugins={[agentAuthPlugin({ adapter })]}
      queryClient={new QueryClient()}
    >
      <AgentApproval />
    </AuthProvider>
  )
  const checkbox = await screen.findByRole("checkbox", {
    name: firstGrant.capability
  })
  const allow = screen.getByRole("button", {
    name: agentAuthLocalization.allow
  })
  const summary = screen.getAllByText(agentAuthLocalization.constraints, {
    selector: "summary"
  })[0]
  assert.exists(summary)
  summary.focus()
  await user.keyboard("{Enter}")
  expect(summary.closest("details")).toHaveProperty("open", true)
  expect(approve).not.toHaveBeenCalled()
  const checkboxLabel = checkbox.closest("label")
  assert.exists(checkboxLabel)
  await user.click(checkboxLabel)
  await user.click(allow)
  await waitFor(() => {
    expect(approve).toHaveBeenCalledWith({
      agentId: "agent",
      approvalId: undefined,
      userCode: undefined,
      capabilities: capabilities.slice(1).map((grant) => grant.capability)
    })
  })
})
it("expands granted permissions without moving or invoking the revoke action", async () => {
  const remove = vi.fn<() => Promise<Record<string, never>>>(() =>
    Promise.resolve({})
  )
  const authClient = {
    getSession: () => Promise.resolve(session),
    oauth2: {
      publicClient: () =>
        Promise.resolve({ client_id: "app", client_name: "App" }),
      deleteConsent: remove
    }
  } as never
  render(
    <AuthProvider
      authClient={authClient}
      navigate={vi.fn<(...args: unknown[]) => void>()}
      plugins={[oauthProviderPlugin()]}
      queryClient={new QueryClient()}
    >
      <AuthorizedApplication
        application={{
          clientId: "app",
          consentIds: ["consent"],
          scopes: ["profile", "email"]
        }}
      />
    </AuthProvider>
  )
  await screen.findByText("App", { exact: true })
  const summary = screen.getByText(oauthProviderLocalization.permissions)
  const revoke = screen.getByRole("button", {
    name: oauthProviderLocalization.removeAuthorization
  })
  const before = revoke.getBoundingClientRect().top
  await user.click(summary)
  const details = summary.closest("details")
  assert.exists(details)
  expect(details.open).toBe(true)
  expect(details.querySelectorAll("li")).toHaveLength(2)
  expect(revoke.getBoundingClientRect().top).toBe(before)
  expect(remove).not.toHaveBeenCalled()
  await user.click(summary)
  expect(details.open).toBe(false)
})
