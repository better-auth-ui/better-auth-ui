import { apiKeyQueryKeys } from "@better-auth-ui/core/plugins/api-key"
import { multiSessionQueryKeys } from "@better-auth-ui/core/plugins/multi-session"
import { passkeyQueryKeys } from "@better-auth-ui/core/plugins/passkey"
import type { AuthPlugin } from "@better-auth-ui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type ReactNode, useState } from "react"

import { ApiKeys } from "@/components/auth/api-key/api-keys"
import { AuthProvider } from "@/components/auth/auth-provider"
import { DangerZone } from "@/components/auth/delete-user/danger-zone"
import { MagicLink } from "@/components/auth/magic-link"
import { ManageAccounts } from "@/components/auth/multi-session/manage-accounts"
import { Passkeys } from "@/components/auth/passkey/passkeys"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import { SignIn } from "@/components/auth/sign-in"
import { Appearance } from "@/components/auth/theme/appearance"
import { Toaster } from "@/components/ui/sonner"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { deleteUserPlugin } from "@/lib/auth/delete-user-plugin"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { themePlugin } from "@/lib/auth/theme-plugin"
import { usernamePlugin } from "@/lib/auth/username-plugin"

import {
  createStoryQueryClient,
  StoryLink,
  StoryShell,
  storyAuthClient,
  storySession,
  storyUserId
} from "./story-fixtures"

const apiKeys = {
  apiKeys: [
    {
      createdAt: new Date("2026-01-12T10:30:00Z"),
      expiresAt: new Date("2026-10-10T10:30:00Z"),
      id: "key_live_storybook",
      name: "Production API",
      start: "bau_live_"
    },
    {
      createdAt: new Date("2026-02-04T16:45:00Z"),
      expiresAt: null,
      id: "key_test_storybook",
      name: "Test integration",
      start: "bau_test_"
    }
  ],
  total: 2
}

const passkeys = [
  {
    createdAt: new Date("2026-05-22T02:57:00Z"),
    id: "passkey_storybook",
    name: "MacBook Touch ID"
  }
]

const deviceSessions = [
  storySession,
  {
    session: {
      ...storySession.session,
      id: "session_storybook_tablet"
    },
    user: {
      ...storySession.user,
      email: "ada+tablet@example.com"
    }
  }
]

const featureAuthClient = {
  ...(storyAuthClient as object),
  apiKey: {
    create: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    list: async () => ({ data: apiKeys, error: null }),
    update: async () => ({ data: null, error: null })
  },
  deleteUser: async () => ({ data: null, error: null }),
  multiSession: {
    listDeviceSessions: async () => ({ data: deviceSessions, error: null }),
    revoke: async () => ({ data: null, error: null }),
    setActive: async () => ({ data: null, error: null })
  },
  passkey: {
    addPasskey: async () => ({ data: null, error: null }),
    deletePasskey: async () => ({ data: null, error: null }),
    listUserPasskeys: async () => ({ data: passkeys, error: null }),
    updatePasskey: async () => ({ data: null, error: null })
  },
  signIn: {
    ...(storyAuthClient as { signIn: object }).signIn,
    magicLink: async () => ({ data: null, error: null }),
    passkey: async () => ({ data: null, error: null })
  }
} as never

function createFeatureQueryClient() {
  const queryClient = createStoryQueryClient()
  const apiKeyQuery = {
    limit: 10,
    offset: 0,
    sortBy: "createdAt",
    sortDirection: "desc"
  }

  queryClient.setQueryData(
    apiKeyQueryKeys.list(storyUserId, apiKeyQuery),
    apiKeys
  )
  queryClient.setQueryData(passkeyQueryKeys.list(storyUserId), passkeys)
  queryClient.setQueryData(
    multiSessionQueryKeys.list(storyUserId),
    deviceSessions
  )

  return queryClient
}

function FeaturePreview({
  children,
  plugins,
  width
}: {
  children: ReactNode
  plugins: AuthPlugin[]
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl" | "max-w-4xl"
}) {
  return (
    <AuthProvider
      authClient={featureAuthClient}
      baseURL="http://localhost:3000"
      Link={StoryLink}
      navigate={() => undefined}
      plugins={plugins}
      queryClient={createFeatureQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toaster />
    </AuthProvider>
  )
}

function ThemePreview() {
  const [theme, setTheme] = useState("system")

  return (
    <FeaturePreview plugins={[themePlugin({ setTheme, theme })]}>
      <Appearance />
    </FeaturePreview>
  )
}

const meta = {
  title: "shadcn/ui/Plugins/Feature coverage",
  parameters: { layout: "fullscreen" }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const MagicLinkPreview: Story = {
  name: "Magic link",
  render: () => (
    <FeaturePreview plugins={[magicLinkPlugin()]} width="max-w-md">
      <MagicLink />
    </FeaturePreview>
  )
}

export const ApiKeysPreview: Story = {
  name: "API keys",
  render: () => (
    <FeaturePreview plugins={[apiKeyPlugin()]}>
      <ApiKeys />
    </FeaturePreview>
  )
}

export const PasskeysPreview: Story = {
  name: "Passkeys",
  render: () => (
    <FeaturePreview plugins={[passkeyPlugin()]}>
      <Passkeys />
    </FeaturePreview>
  )
}

export const MultiSessionPreview: Story = {
  name: "Multiple sessions",
  render: () => (
    <FeaturePreview plugins={[multiSessionPlugin()]}>
      <ManageAccounts />
    </FeaturePreview>
  )
}

export const DeleteUserPreview: Story = {
  name: "Delete user",
  render: () => (
    <FeaturePreview plugins={[deleteUserPlugin()]}>
      <DangerZone />
    </FeaturePreview>
  )
}

export const ThemePreviewStory: Story = {
  name: "Theme",
  render: () => <ThemePreview />
}

export const UsernameSignInPreview: Story = {
  name: "Username sign in",
  render: () => (
    <FeaturePreview
      plugins={[usernamePlugin({ isUsernameAvailable: true })]}
      width="max-w-md"
    >
      <SignIn />
    </FeaturePreview>
  )
}

export const UsernameProfilePreview: Story = {
  name: "Username profile",
  render: () => (
    <FeaturePreview plugins={[usernamePlugin({ isUsernameAvailable: true })]}>
      <UserProfile />
    </FeaturePreview>
  )
}
