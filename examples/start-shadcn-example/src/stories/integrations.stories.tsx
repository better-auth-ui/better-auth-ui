import type { AgentAuthAdapter } from "@better-auth-ui/core/plugins/agent-auth"
import type { BillingAdapter } from "@better-auth-ui/core/plugins/billing"
import type {
  ManagedOAuthClient,
  OAuthClientManager
} from "@better-auth-ui/core/plugins/oauth-provider"
import type {
  SiweWalletConnector,
  SiweWalletManager
} from "@better-auth-ui/core/plugins/siwe"
import type { AuthPlugin } from "@better-auth-ui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { expect, fn, within } from "storybook/test"

import { AgentAuthorizations } from "@/components/auth/agent-auth/agent-authorizations"
import { AuthProvider } from "@/components/auth/auth-provider"
import { BillingSettings } from "@/components/auth/billing/billing-settings"
import { UserActivity } from "@/components/auth/dash/activity"
import { OAuthClients } from "@/components/auth/oauth-provider/oauth-clients"
import { WalletAccounts } from "@/components/auth/siwe/wallet-accounts"
import { Toaster } from "@/components/ui/sonner"
import { agentAuthPlugin } from "@/lib/auth/agent-auth-plugin"
import { billingPlugin } from "@/lib/auth/billing-plugin"
import { dashPlugin } from "@/lib/auth/dash-plugin"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { siwePlugin } from "@/lib/auth/siwe-plugin"

import {
  createStoryQueryClient,
  StoryLink,
  StoryShell,
  storyActions,
  storyAuthClient,
  storyUserId
} from "./story-fixtures"

const integrationActions = {
  agentRevoke: fn(async () => undefined).mockName("agentAuthAdapter.revoke"),
  billingCancel: fn(async () => ({})).mockName("billingAdapter.cancel"),
  billingCheckout: fn(async () => ({})).mockName("billingAdapter.checkout"),
  billingOpenPortal: fn(async () => ({})).mockName("billingAdapter.openPortal"),
  billingRestore: fn(async () => ({})).mockName("billingAdapter.restore"),
  billingUpdateSeats: fn(async () => ({})).mockName(
    "billingAdapter.updateSeats"
  ),
  oauthCreate: fn(async (_owner, input) => ({
    ...input,
    client_id: "storybook-new-client",
    client_secret: "storybook-secret"
  })).mockName("oauthClientManager.create"),
  oauthDelete: fn(async () => undefined).mockName("oauthClientManager.delete"),
  walletConnect: fn(async () => ({
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    chainId: 1
  })).mockName("walletConnector.connect"),
  walletLink: fn(async () => undefined).mockName("walletManager.link"),
  walletSetPrimary: fn(async () => undefined).mockName(
    "walletManager.setPrimary"
  ),
  walletSignMessage: fn(async () => "0xstorybook-signature").mockName(
    "walletConnector.signMessage"
  ),
  walletUnlink: fn(async () => undefined).mockName("walletManager.unlink")
}

const billingAdapter = {
  id: "storybook-billing",
  scopes: { organization: true, user: true },
  supports: { cancel: true, restore: true, seats: true },
  async listPlans() {
    return [
      {
        id: "starter",
        name: "Starter",
        description: "For personal projects and prototypes.",
        prices: [
          {
            amount: 900,
            currency: "USD",
            id: "starter-month",
            interval: "month"
          },
          {
            amount: 9000,
            currency: "USD",
            id: "starter-year",
            interval: "year"
          }
        ],
        features: ["Three projects", "Community support"]
      },
      {
        highlighted: true,
        id: "pro",
        name: "Pro",
        description: "For teams shipping production applications.",
        prices: [
          { amount: 2900, currency: "USD", id: "pro-month", interval: "month" },
          { amount: 29000, currency: "USD", id: "pro-year", interval: "year" }
        ],
        features: ["Unlimited projects", "Priority support", "Audit history"]
      }
    ]
  },
  async getState() {
    return {
      subscription: {
        currentPeriodEnd: new Date("2026-09-23T12:00:00Z"),
        id: "subscription_storybook",
        interval: "month",
        planId: "pro",
        planName: "Pro",
        priceId: "pro-month",
        seats: 6,
        status: "active"
      },
      usage: [
        {
          id: "projects",
          label: "Projects",
          limit: 20,
          unit: "projects",
          used: 8
        },
        {
          id: "members",
          label: "Team members",
          limit: 10,
          unit: "members",
          used: 6
        }
      ]
    }
  },
  checkout: integrationActions.billingCheckout,
  openPortal: integrationActions.billingOpenPortal,
  cancel: integrationActions.billingCancel,
  restore: integrationActions.billingRestore,
  updateSeats: integrationActions.billingUpdateSeats
} satisfies BillingAdapter

const oauthClient: ManagedOAuthClient = {
  application_type: "web",
  client_id: "storybook-dashboard",
  client_id_issued_at: 1_756_800_000,
  client_name: "Storybook dashboard",
  client_uri: "https://example.com",
  redirect_uris: ["https://example.com/auth/callback"],
  scope: "openid profile email"
}

const oauthClientManager = {
  async list() {
    return [oauthClient]
  },
  create: integrationActions.oauthCreate,
  async update(_owner, clientId, update) {
    return { ...oauthClient, ...update, client_id: clientId }
  },
  delete: integrationActions.oauthDelete,
  async rotateSecret(_owner, clientId) {
    return {
      ...oauthClient,
      client_id: clientId,
      client_secret: "storybook-rotated-secret"
    }
  },
  async setDisabled(_owner, clientId, disabled) {
    return { ...oauthClient, client_id: clientId, disabled }
  }
} satisfies OAuthClientManager

const agentAuthAdapter = {
  async getApproval() {
    throw new Error("No approval is pending in this story.")
  },
  async approve() {},
  async deny() {},
  async listAgents() {
    return [
      {
        createdAt: new Date("2026-07-11T09:00:00Z"),
        grants: [
          {
            approvalStrength: "session",
            capability: "calendar.read",
            description: "Read upcoming calendar events",
            status: "active"
          },
          {
            approvalStrength: "webauthn",
            capability: "email.send",
            description: "Draft and send email messages",
            status: "pending"
          }
        ],
        hostId: "codex-desktop",
        hostName: "Codex Desktop",
        id: "agent_storybook",
        lastUsedAt: new Date("2026-08-23T08:15:00Z"),
        mode: "delegated",
        name: "Workspace assistant",
        status: "active"
      }
    ]
  },
  revoke: integrationActions.agentRevoke
} satisfies AgentAuthAdapter

const walletManager = {
  async list() {
    return [
      {
        address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        chainId: 1,
        createdAt: new Date("2026-06-18T14:00:00Z"),
        id: "wallet_storybook",
        isPrimary: true
      }
    ]
  },
  async createLinkChallenge() {
    return { message: "Storybook wallet linking challenge" }
  },
  link: integrationActions.walletLink,
  unlink: integrationActions.walletUnlink,
  setPrimary: integrationActions.walletSetPrimary
} satisfies SiweWalletManager

const walletConnector = {
  id: "storybook-wallet",
  label: "Storybook wallet",
  connect: integrationActions.walletConnect,
  signMessage: integrationActions.walletSignMessage
} satisfies SiweWalletConnector

const activityResponse = {
  events: [
    {
      createdAt: "2026-08-23T08:15:00Z",
      eventData: { loginMethod: "passkey" },
      eventKey: "event_sign_in",
      eventType: "user_signed_in",
      location: {
        city: "Zürich",
        country: "Switzerland",
        ipAddress: "127.0.0.1"
      },
      projectId: "project_storybook",
      updatedAt: "2026-08-23T08:15:00Z"
    },
    {
      createdAt: "2026-08-22T16:40:00Z",
      eventData: { providerId: "github" },
      eventKey: "event_account_linked",
      eventType: "account_linked",
      location: { city: "London", country: "United Kingdom" },
      projectId: "project_storybook",
      updatedAt: "2026-08-22T16:40:00Z"
    }
  ],
  limit: 20,
  offset: 0,
  total: 2
}

const integrationAuthClient = {
  ...(storyAuthClient as object),
  dash: {
    getAllAuditLogs: fn(async () => ({
      data: activityResponse,
      error: null
    })).mockName("authClient.dash.getAllAuditLogs"),
    getAuditLogs: fn(async () => ({
      data: activityResponse,
      error: null
    })).mockName("authClient.dash.getAuditLogs")
  }
} as never

function IntegrationPreview({
  children,
  plugins,
  redirectTo = "/settings/account",
  width = "max-w-4xl"
}: {
  children: ReactNode
  plugins: AuthPlugin[]
  redirectTo?: string
  width?: "max-w-xl" | "max-w-2xl" | "max-w-4xl"
}) {
  return (
    <AuthProvider
      authClient={integrationAuthClient}
      Link={StoryLink}
      navigate={storyActions.navigate}
      plugins={plugins}
      queryClient={createStoryQueryClient()}
      redirectTo={redirectTo}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  title: "shadcn/ui/Plugins/Integrations",
  args: {
    oauthOwnerKey: storyUserId,
    redirectTo: "/settings/account",
    walletDomain: "storybook.local"
  },
  argTypes: {
    oauthOwnerKey: { control: "text" },
    redirectTo: { control: "text" },
    walletDomain: { control: "text" }
  },
  parameters: { layout: "fullscreen" }
} satisfies Meta<{
  oauthOwnerKey?: string
  redirectTo?: string
  walletDomain?: string
}>

export default meta

type Story = StoryObj<{
  oauthOwnerKey?: string
  redirectTo?: string
  walletDomain?: string
}>

export const BillingPreview: Story = {
  name: "Billing",
  render: ({ redirectTo = "/settings/account" }) => (
    <IntegrationPreview
      plugins={[billingPlugin({ adapter: billingAdapter })]}
      redirectTo={redirectTo}
    >
      <BillingSettings
        adapter={billingAdapter}
        scope={{ type: "user", userId: storyUserId }}
      />
    </IntegrationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("open the billing portal", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Manage billing" })
      )
      await expect(integrationActions.billingOpenPortal).toHaveBeenCalled()
    })
  }
}

export const OAuthClientsPreview: Story = {
  name: "OAuth clients",
  render: ({
    oauthOwnerKey = storyUserId,
    redirectTo = "/settings/account"
  }) => (
    <IntegrationPreview
      plugins={[oauthProviderPlugin({ clientManager: oauthClientManager })]}
      redirectTo={redirectTo}
    >
      <OAuthClients
        manager={oauthClientManager}
        owner={{ type: "user" }}
        ownerKey={oauthOwnerKey}
      />
    </IntegrationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open OAuth client creation", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Create client" })
      )
      await expect(
        within(canvasElement.ownerDocument.body).getByRole("dialog")
      ).toBeVisible()
    })
  }
}

export const AgentAuthorizationsPreview: Story = {
  name: "Agent authorizations",
  render: () => (
    <IntegrationPreview
      plugins={[agentAuthPlugin({ adapter: agentAuthAdapter })]}
      width="max-w-2xl"
    >
      <AgentAuthorizations />
    </IntegrationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("revoke an agent capability", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: "Revoke calendar.read" })
      )
      await userEvent.click(
        within(canvasElement.ownerDocument.body).getByRole("button", {
          name: "Revoke capability"
        })
      )
      await expect(integrationActions.agentRevoke).toHaveBeenCalled()
    })
  }
}

export const WalletAccountsPreview: Story = {
  name: "Wallet accounts",
  render: ({ walletDomain = "storybook.local" }) => (
    <IntegrationPreview
      plugins={[
        siwePlugin({
          connector: walletConnector,
          domain: walletDomain,
          uri: `https://${walletDomain}`,
          walletManager
        })
      ]}
      width="max-w-2xl"
    >
      <WalletAccounts />
    </IntegrationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("connect a wallet", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Connect wallet" })
      )
      await expect(integrationActions.walletConnect).toHaveBeenCalled()
      await expect(integrationActions.walletLink).toHaveBeenCalled()
    })
  }
}

export const ActivityPreview: Story = {
  name: "Activity",
  render: () => (
    <IntegrationPreview plugins={[dashPlugin()]} width="max-w-2xl">
      <UserActivity />
    </IntegrationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("filter the activity feed", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Identifier" }),
        "ada@example.com"
      )
      await expect(canvas.getByText("Signed in")).toBeVisible()
    })
  }
}
