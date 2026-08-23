import { apiKeyQueryKeys } from "@better-auth-ui/core/plugins/api-key"
import { multiSessionQueryKeys } from "@better-auth-ui/core/plugins/multi-session"
import { passkeyQueryKeys } from "@better-auth-ui/core/plugins/passkey"
import { AuthProvider, SignIn, UserProfile } from "@better-auth-ui/heroui"
import { ApiKeys, apiKeyPlugin } from "@better-auth-ui/heroui/plugins/api-key"
import {
  DangerZone,
  deleteUserPlugin
} from "@better-auth-ui/heroui/plugins/delete-user"
import {
  MagicLink,
  magicLinkPlugin
} from "@better-auth-ui/heroui/plugins/magic-link"
import {
  ManageAccounts,
  multiSessionPlugin
} from "@better-auth-ui/heroui/plugins/multi-session"
import { Passkeys, passkeyPlugin } from "@better-auth-ui/heroui/plugins/passkey"
import { Appearance, themePlugin } from "@better-auth-ui/heroui/plugins/theme"
import { usernamePlugin } from "@better-auth-ui/heroui/plugins/username"
import type { AuthPlugin } from "@better-auth-ui/react"
import { Toast } from "@heroui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type ReactNode, useState } from "react"

import {
  createStoryQueryClient,
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
      navigate={() => undefined}
      plugins={plugins}
      queryClient={createFeatureQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toast.Provider />
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
  title: "HeroUI/Plugins/Feature coverage",
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
