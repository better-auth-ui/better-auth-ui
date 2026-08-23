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
import { AuthProvider } from "@better-auth-ui/heroui"
import {
  AgentAuthorizations,
  agentAuthPlugin,
  BillingSettings,
  billingPlugin,
  dashPlugin,
  OAuthClients,
  oauthProviderPlugin,
  siwePlugin,
  UserActivity,
  WalletAccounts
} from "@better-auth-ui/heroui/plugins"
import type { AuthPlugin } from "@better-auth-ui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

import {
  createStoryQueryClient,
  StoryShell,
  storyAuthClient,
  storyUserId
} from "./story-fixtures"

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
  async checkout() {
    return {}
  },
  async openPortal() {
    return {}
  },
  async cancel() {
    return {}
  },
  async restore() {
    return {}
  },
  async updateSeats() {
    return {}
  }
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
  async create(_owner, input) {
    return {
      ...input,
      client_id: "storybook-new-client",
      client_secret: "storybook-secret"
    }
  },
  async update(_owner, clientId, update) {
    return { ...oauthClient, ...update, client_id: clientId }
  },
  async delete() {},
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
  async revoke() {}
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
  async link() {},
  async unlink() {},
  async setPrimary() {}
} satisfies SiweWalletManager

const walletConnector = {
  id: "storybook-wallet",
  label: "Storybook wallet",
  async connect() {
    return { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", chainId: 1 }
  },
  async signMessage() {
    return "0xstorybook-signature"
  }
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
    getAllAuditLogs: async () => ({ data: activityResponse, error: null }),
    getAuditLogs: async () => ({ data: activityResponse, error: null })
  }
} as never

function IntegrationPreview({
  children,
  plugins,
  width = "max-w-4xl"
}: {
  children: ReactNode
  plugins: AuthPlugin[]
  width?: "max-w-xl" | "max-w-2xl" | "max-w-4xl"
}) {
  return (
    <AuthProvider
      authClient={integrationAuthClient}
      navigate={() => undefined}
      plugins={plugins}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
    >
      <StoryShell width={width}>{children}</StoryShell>
    </AuthProvider>
  )
}

const meta = {
  title: "HeroUI/Plugins/Integrations",
  parameters: { layout: "fullscreen" }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const BillingPreview: Story = {
  name: "Billing",
  render: () => (
    <IntegrationPreview plugins={[billingPlugin({ adapter: billingAdapter })]}>
      <BillingSettings
        adapter={billingAdapter}
        scope={{ type: "user", userId: storyUserId }}
      />
    </IntegrationPreview>
  )
}

export const OAuthClientsPreview: Story = {
  name: "OAuth clients",
  render: () => (
    <IntegrationPreview
      plugins={[oauthProviderPlugin({ clientManager: oauthClientManager })]}
    >
      <OAuthClients
        manager={oauthClientManager}
        owner={{ type: "user" }}
        ownerKey={storyUserId}
      />
    </IntegrationPreview>
  )
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
  )
}

export const WalletAccountsPreview: Story = {
  name: "Wallet accounts",
  render: () => (
    <IntegrationPreview
      plugins={[
        siwePlugin({
          connector: walletConnector,
          domain: "storybook.local",
          uri: "https://storybook.local",
          walletManager
        })
      ]}
      width="max-w-2xl"
    >
      <WalletAccounts />
    </IntegrationPreview>
  )
}

export const ActivityPreview: Story = {
  name: "Activity",
  render: () => (
    <IntegrationPreview plugins={[dashPlugin()]} width="max-w-2xl">
      <UserActivity />
    </IntegrationPreview>
  )
}
