import { cleanup, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { ApiKeys } from "../src/components/auth/api-key/api-keys"
import { OrganizationMemberRow } from "../src/components/auth/organization/organization-member-row"
import { OrganizationTeams } from "../src/components/auth/organization/organization-teams"
import { AgentApproval } from "../src/components/auth/agent-auth/agent-approval"
import { BillingSettings } from "../src/components/auth/billing/billing-settings"
import { AdminUsers } from "../src/components/auth/admin/admin-users"
import { Passkeys } from "../src/components/auth/passkey/passkeys"
import { OAuthConsent } from "../src/components/auth/oauth-provider/oauth-consent"
import { EmailFirstSignIn } from "../src/components/auth/sso/email-first-sign-in"
import { apiKeyPlugin } from "../src/lib/auth/api-key-plugin"
import { organizationPlugin } from "../src/lib/auth/organization-plugin"
import { agentAuthPlugin } from "../src/lib/auth/agent-auth-plugin"
import { billingPlugin } from "../src/lib/auth/billing-plugin"
import { adminPlugin } from "../src/lib/auth/admin-plugin"
import { passkeyPlugin } from "../src/lib/auth/passkey-plugin"
import { oauthProviderPlugin } from "../src/lib/auth/oauth-provider-plugin"
import { ssoPlugin } from "../src/lib/auth/sso-plugin"
import { nativeApp } from "./support/native-app"
vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({ SaveFormat: { PNG: "png" } }))
afterEach(cleanup)
const organization = {
  id: "org",
  slug: "acme",
  name: "Acme",
  createdAt: new Date()
}
const member = {
  id: "member",
  organizationId: "org",
  userId: "user",
  role: "owner,member",
  createdAt: new Date(),
  user: { id: "user", name: "Ada", email: "ada@example.com" }
}

it("loads owners outside the first page before allowing removal, and retains content during permissions", async () => {
  let resolvePermissions!: (value: { success: boolean }) => void
  const permissions = new Promise<{ success: boolean }>((resolve) => {
    resolvePermissions = resolve
  })
  const listMembers = vi.fn(async ({ query }) =>
    query.offset === 0
      ? { members: [member], total: 2 }
      : {
          members: [{ ...member, id: "second-owner", userId: "other" }],
          total: 2
        }
  )
  const updateMemberRole = vi.fn(async () => ({}))
  const app = nativeApp({
    authenticated: true,
    plugins: [organizationPlugin({ slug: "acme" })],
    client: {
      organization: {
        getFullOrganization: async () => organization,
        hasPermission: () => permissions,
        listMembers,
        updateMemberRole
      }
    }
  })
  app.render(
    <OrganizationMemberRow
      member={member}
      organization={organization}
      isOwner
    />
  )
  expect(screen.getByText("Ada")).toBeTruthy()
  await waitFor(() => expect(listMembers).toHaveBeenCalledTimes(2))
  expect(listMembers.mock.calls[1]![0].query).toMatchObject({
    organizationId: "org",
    offset: 1
  })
  resolvePermissions({ success: true })
  await screen.findByRole("button", { name: "Change role" })
  expect(
    screen.getByRole("button", { name: "Leave organization" })
  ).not.toHaveAttribute("aria-disabled", "true")
  const user = userEvent.setup()
  await user.click(await screen.findByRole("button", { name: "Change role" }))
  await user.click(screen.getByRole("checkbox", { name: "Admin", exact: true }))
  await user.click(
    screen.getByRole("button", { name: "Save changes", exact: true })
  )
  await waitFor(() =>
    expect(updateMemberRole).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org",
        memberId: "member",
        role: ["owner", "member", "admin"]
      })
    )
  )
})
it("protects a multi-role final owner from leaving or being demoted", async () => {
  const updateMemberRole = vi.fn(async () => ({}))
  const app = nativeApp({
    authenticated: true,
    plugins: [organizationPlugin({ slug: "acme" })],
    client: {
      organization: {
        getFullOrganization: async () => organization,
        hasPermission: async () => ({ success: true }),
        listMembers: async () => ({ members: [member], total: 1 }),
        updateMemberRole
      }
    }
  })
  app.render(
    <OrganizationMemberRow
      member={member}
      organization={organization}
      isOwner
    />
  )
  await screen.findByText("Transfer ownership before removing the only owner.")
  expect(
    screen.getByRole("button", { name: "Leave organization" })
  ).toHaveAttribute("aria-disabled", "true")
  const user = userEvent.setup()
  await user.click(await screen.findByRole("button", { name: "Change role" }))
  await user.click(screen.getByRole("checkbox", { name: "Owner", exact: true }))
  expect(
    screen.getByRole("button", { name: "Save changes", exact: true })
  ).toHaveAttribute("aria-disabled", "true")
  expect(updateMemberRole).not.toHaveBeenCalled()
})
it("honors the final-team policy and changes the selected team through the route", async () => {
  const app = nativeApp({
    authenticated: true,
    plugins: [organizationPlugin({ teams: true })],
    client: {
      organization: {
        listTeams: async () => [{ id: "team", name: "Support" }],
        hasPermission: async () => ({ success: true }),
        getFullOrganization: async () => organization,
        listTeamMembers: async () => [],
        listMembers: async () => ({ members: [], total: 0 })
      }
    }
  })
  app.render(<OrganizationTeams organizationId="org" organizationSlug="acme" />)
  await screen.findByText("Support")
  expect(
    screen.getByRole("button", { name: "Delete team", exact: true })
  ).toHaveAttribute("aria-disabled", "true")
  const user = userEvent.setup()
  await user.click(screen.getByRole("combobox", { name: /Select a team/ }))
  await user.click(screen.getAllByText("Support").at(-1)!)
  expect(app.navigation.push).toHaveBeenCalledWith(
    { section: "organization", view: "teams", slug: "acme" },
    { replace: true, params: { teamId: "team" } }
  )
})
it("creates a key in the configured group and converts its expiration days to seconds", async () => {
  const create = vi.fn(async () => ({ id: "new", key: "secret" }))
  const list = vi.fn(async () => ({ apiKeys: [], total: 0 }))
  const app = nativeApp({
    authenticated: true,
    plugins: [
      apiKeyPlugin({
        configurations: [{ id: "automation", label: "Automation" }],
        keyExpiration: { intervals: [7], defaultInterval: 7, allowNever: false }
      })
    ],
    client: { apiKey: { list, create } }
  })
  app.render(<ApiKeys />)
  const user = userEvent.setup()
  await waitFor(() =>
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ query: { configId: "automation" } })
    )
  )
  await user.click(
    screen.getByRole("button", { name: "Create API key", exact: true })
  )
  await user.type(
    within(screen.getByRole("alert")).getByRole("textbox", { name: "Name" }),
    "deploy"
  )
  await user.click(
    within(screen.getByRole("alert")).getByRole("button", {
      name: "Create API key",
      exact: true
    })
  )
  await waitFor(() =>
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        configId: "automation",
        name: "deploy",
        expiresIn: 604800
      })
    )
  )
  await screen.findByText("secret")
})
it("requires an explicit agent decision and sends only the selected server capabilities", async () => {
  const approve = vi.fn(async () => {})
  const adapter = {
    getApproval: async () => ({
      id: "agent",
      name: "Build agent",
      status: "pending",
      mode: "delegated" as const,
      hostId: "host",
      grants: [],
      createdAt: new Date(),
      requestedCapabilities: [
        {
          capability: "read",
          status: "pending" as const,
          approvalStrength: "session" as const
        },
        {
          capability: "write",
          status: "pending" as const,
          approvalStrength: "session" as const
        }
      ]
    }),
    approve,
    deny: vi.fn(async () => {}),
    listAgents: async () => [],
    revoke: async () => {}
  }
  const app = nativeApp({
    authenticated: true,
    plugins: [agentAuthPlugin({ adapter })]
  })
  app.render(
    <AgentApproval request={{ agentId: "agent", approvalId: "approval" }} />
  )
  await screen.findByText("Build agent")
  expect(approve).not.toHaveBeenCalled()
  const user = userEvent.setup()
  await user.click(screen.getByRole("checkbox", { name: /write/ }))
  await user.click(
    screen.getByRole("button", { name: "Allow selected", exact: true })
  )
  await waitFor(() =>
    expect(approve).toHaveBeenCalledWith({
      agentId: "agent",
      approvalId: "approval",
      capabilities: ["read"]
    })
  )
})
it("scopes billing to the supplied organization and confirms subscription cancellation", async () => {
  const cancel = vi.fn(async () => ({}))
  const adapter = {
    id: "billing",
    supports: { cancel: true, restore: true, seats: true },
    listPlans: async () => [],
    getState: async () => ({
      subscription: {
        id: "subscription",
        planId: "plan",
        status: "active" as const,
        seats: 2
      },
      usage: []
    }),
    checkout: async () => ({}),
    openPortal: async () => ({}),
    cancel,
    restore: async () => ({}),
    updateSeats: vi.fn(async () => ({}))
  }
  const scope = {
    type: "organization" as const,
    organizationId: "org",
    organizationSlug: "acme"
  }
  const app = nativeApp({
    authenticated: true,
    plugins: [billingPlugin({ adapter, organization: true })]
  })
  app.render(<BillingSettings adapter={adapter} scope={scope} />)
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole("button", {
      name: "Cancel subscription",
      exact: true
    })
  )
  expect(cancel).not.toHaveBeenCalled()
  await user.click(
    within(screen.getByRole("alert")).getByRole("button", {
      name: "Confirm",
      exact: true
    })
  )
  await waitFor(() =>
    expect(cancel).toHaveBeenCalledWith(scope, "subscription")
  )
})
it("does not request admin users when the server denies list access", async () => {
  const listUsers = vi.fn(async () => ({ users: [], total: 0 }))
  const app = nativeApp({
    authenticated: true,
    plugins: [adminPlugin()],
    client: {
      admin: {
        hasPermission: async () => ({ data: { success: false }, error: null }),
        listUsers
      }
    }
  })
  app.render(<AdminUsers />)
  await screen.findByText("You don't have permission to do this.")
  expect(listUsers).not.toHaveBeenCalled()
})
it("renames a passkey through the supplied native ceremony client", async () => {
  const updatePasskey = vi.fn(async () => ({}))
  const client = {
    passkey: {
      listUserPasskeys: async () => [
        { id: "passkey", name: "Old name", createdAt: new Date() }
      ],
      updatePasskey
    },
    getSession: async () => null
  } as unknown as Parameters<typeof passkeyPlugin>[0]["client"]
  const app = nativeApp({
    authenticated: true,
    plugins: [passkeyPlugin({ client })]
  })
  app.render(<Passkeys />)
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole("button", { name: "Rename passkey", exact: true })
  )
  const input = screen.getByRole("textbox", { name: "Name" })
  await user.clear(input)
  await user.type(input, "Phone")
  await user.click(
    within(screen.getByRole("alert")).getByRole("button", {
      name: "Rename passkey",
      exact: true
    })
  )
  await waitFor(() =>
    expect(updatePasskey).toHaveBeenCalledWith(
      expect.objectContaining({ id: "passkey", name: "Phone" })
    )
  )
})
it("blocks OAuth consent if the authorization server rejects the signed request", async () => {
  const consent = vi.fn(async () => ({ url: "myapp://callback" }))
  const app = nativeApp({
    authenticated: true,
    plugins: [oauthProviderPlugin()],
    params: {
      oauth_query:
        "client_id=client&scope=openid&redirect_uri=myapp%3A%2F%2Fcallback&sig=bad&exp=1"
    },
    client: {
      oauth2: {
        publicClientPrelogin: async () => {
          throw new Error("Expired request")
        },
        consent
      }
    }
  })
  app.render(<OAuthConsent />)
  await screen.findByText(
    "This authorization request is missing required information or is no longer valid."
  )
  expect(consent).not.toHaveBeenCalled()
  const buttons = screen
    .getAllByRole("button")
    .filter((button) => /Allow|Authorize|Deny/.test(button.textContent ?? ""))
  for (const button of buttons)
    expect(button).toHaveAttribute("aria-disabled", "true")
})
it("keeps the entered email when SSO discovery returns no provider", async () => {
  const sso = vi.fn(async () => {
    throw Object.assign(new Error("Not found"), { status: 404 })
  })
  const app = nativeApp({
    plugins: [ssoPlugin({ emailFirst: true })],
    client: { signIn: { sso } }
  })
  app.render(<EmailFirstSignIn />)
  const user = userEvent.setup()
  await user.type(
    screen.getByRole("textbox", { name: "Email" }),
    "ada@example.com"
  )
  await user.click(
    screen.getByRole("button", { name: "Continue with email", exact: true })
  )
  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue(
      "ada@example.com"
    )
  )
  expect(sso).toHaveBeenCalledWith(
    expect.objectContaining({
      email: "ada@example.com",
      loginHint: "ada@example.com"
    })
  )
})
