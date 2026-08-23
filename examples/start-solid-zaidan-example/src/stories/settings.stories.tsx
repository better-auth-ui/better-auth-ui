import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/solid-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AccountSettings } from "@/components/auth/settings/account/account-settings"
import { ChangeEmail } from "@/components/auth/settings/account/change-email"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import { ActiveSessionsSettings } from "@/components/auth/settings/security/active-sessions"
import { ChangePasswordSettings } from "@/components/auth/settings/security/change-password"
import { LinkedAccountsSettings } from "@/components/auth/settings/security/linked-accounts"
import { SecuritySettings } from "@/components/auth/settings/security/security-settings"
import { Settings } from "@/components/auth/settings/settings"
import { storyRenders, withStoryActions } from "./story-coverage"

const sessionData = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_settings_docs",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId: "user_settings_docs"
  },
  user: {
    email: "ada@example.com",
    emailVerified: true,
    id: "user_settings_docs",
    image: null,
    name: "Ada Lovelace"
  }
}

const linkedAccounts = [
  {
    accountId: "credential_account",
    id: "credential_account",
    providerId: "credential"
  },
  {
    accountId: "github_account",
    id: "github_account",
    providerId: "github"
  }
]

const activeSessions = [
  {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_settings_docs",
    ipAddress: "127.0.0.1",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    userId: "user_settings_docs"
  },
  {
    createdAt: new Date("2026-01-11T08:15:00Z"),
    expiresAt: new Date("2026-01-12T08:15:00Z"),
    id: "session_settings_phone",
    ipAddress: "127.0.0.2",
    token: "",
    updatedAt: new Date("2026-01-11T08:15:00Z"),
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    userId: "user_settings_docs"
  }
]

const mockAuthClient = withStoryActions(
  {
    changeEmail: async () => ({ data: null, error: null }),
    changePassword: async () => ({ data: null, error: null }),
    getSession: async () => ({ data: sessionData, error: null }),
    listAccounts: async () => ({ data: linkedAccounts, error: null }),
    listSessions: async () => ({ data: activeSessions, error: null }),
    linkSocial: async () => ({ data: null, error: null }),
    requestPasswordReset: async () => ({ data: null, error: null }),
    revokeSession: async () => ({ data: null, error: null }),
    signOut: async () => ({ data: null, error: null }),
    unlinkAccount: async () => ({ data: null, error: null }),
    updateUser: async () => ({ data: null, error: null })
  },
  "authClient"
) as never

function createStoryQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, sessionData)
  queryClient.setQueryData(
    authQueryKeys.listAccounts(sessionData.user.id),
    linkedAccounts
  )
  queryClient.setQueryData(
    authQueryKeys.listSessions(sessionData.user.id),
    activeSessions
  )

  return queryClient
}

type SettingsStoryArgs = {
  multipleAccountsPerProvider?: boolean
  redirectTo?: string
  socialProviders?: ("github" | "google")[]
}

function SettingsStoryProvider(
  props: SettingsStoryArgs & { children: () => JSX.Element }
) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      multipleAccountsPerProvider={props.multipleAccountsPerProvider ?? false}
      navigate={() => undefined}
      queryClient={createStoryQueryClient()}
      redirectTo={props.redirectTo ?? "/settings/account"}
      socialProviders={props.socialProviders ?? ["github", "google"]}
    >
      {props.children}
    </AuthProvider>
  )
}

function SettingsPreviewShell(props: { children: JSX.Element }) {
  return (
    <main class="flex h-screen min-h-0 w-full items-center justify-center overflow-hidden bg-background p-8 text-foreground">
      <div class="max-h-full w-full max-w-2xl overflow-hidden">
        {props.children}
      </div>
    </main>
  )
}

function createSettingsRouter(component: () => JSX.Element) {
  const rootRoute = createRootRoute({ component })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component
  })
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings/$path",
    component
  })

  return createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree: rootRoute.addChildren([indexRoute, settingsRoute])
  })
}

function SettingsPreviewStory(
  props: SettingsStoryArgs & { children: JSX.Element }
) {
  return (
    <RouterProvider
      router={createSettingsRouter(() => (
        <SettingsStoryProvider {...props}>
          {() => <SettingsPreviewShell>{props.children}</SettingsPreviewShell>}
        </SettingsStoryProvider>
      ))}
    />
  )
}

const meta = {
  title: "Zaidan/Components/Settings",
  args: {
    multipleAccountsPerProvider: false,
    redirectTo: "/settings/account",
    socialProviders: ["github", "google"]
  },
  argTypes: {
    multipleAccountsPerProvider: { control: "boolean" },
    redirectTo: { control: "text" },
    socialProviders: { control: "check", options: ["github", "google"] }
  },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<SettingsStoryArgs>

export default meta

type Story = StoryObj<SettingsStoryArgs>

export const SettingsPreview: Story = {
  play: storyRenders,
  render: (args) => (
    <SettingsPreviewStory {...args}>
      <Settings view="account" />
    </SettingsPreviewStory>
  )
}

export const AccountSettingsPreview: Story = {
  play: storyRenders,
  render: (args) => (
    <SettingsPreviewStory {...args}>
      <AccountSettings />
    </SettingsPreviewStory>
  )
}

export const UserProfilePreview: Story = {
  play: storyRenders,
  render: (args) => (
    <SettingsPreviewStory {...args}>
      <UserProfile />
    </SettingsPreviewStory>
  )
}

export const ChangeEmailPreview: Story = {
  play: storyRenders,
  render: (args) => (
    <SettingsPreviewStory {...args}>
      <ChangeEmail />
    </SettingsPreviewStory>
  )
}

export const SecuritySettingsPreview: Story = {
  play: storyRenders,
  render: (args) => (
    <SettingsPreviewStory {...args}>
      <SecuritySettings />
    </SettingsPreviewStory>
  )
}

export const ChangePasswordPreview: Story = {
  play: storyRenders,
  render: (args) => (
    <SettingsPreviewStory {...args}>
      <ChangePasswordSettings />
    </SettingsPreviewStory>
  )
}

export const LinkedAccountsPreview: Story = {
  play: storyRenders,
  render: (args) => (
    <SettingsPreviewStory {...args}>
      <LinkedAccountsSettings />
    </SettingsPreviewStory>
  )
}

export const ActiveSessionsPreview: Story = {
  play: storyRenders,
  render: (args) => (
    <SettingsPreviewStory {...args}>
      <ActiveSessionsSettings />
    </SettingsPreviewStory>
  )
}
