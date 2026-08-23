import { apiKeyQueryKeys } from "@better-auth-ui/core/plugins/api-key"
import { multiSessionQueryKeys } from "@better-auth-ui/core/plugins/multi-session"
import { passkeyQueryKeys } from "@better-auth-ui/core/plugins/passkey"
import { AuthProvider, UserProfile } from "@better-auth-ui/heroui"
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
import {
  SignInUsername,
  usernamePlugin
} from "@better-auth-ui/heroui/plugins/username"
import type { AuthPlugin } from "@better-auth-ui/react"
import { Toast } from "@heroui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type ReactNode, useEffect, useState } from "react"
import { expect, fn, within } from "storybook/test"

import {
  createStoryQueryClient,
  StoryShell,
  storyActions,
  storyAuthClient,
  storySession,
  storyUserId
} from "../support/story-fixtures"
import { applyStoryTheme, type StoryTheme } from "../support/story-theme"

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

const featureActions = {
  addPasskey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.passkey.addPasskey"
  ),
  createApiKey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.apiKey.create"
  ),
  deleteApiKey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.apiKey.delete"
  ),
  deletePasskey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.passkey.deletePasskey"
  ),
  deleteUser: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.deleteUser"
  ),
  magicLink: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signIn.magicLink"
  ),
  revokeDeviceSession: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.multiSession.revoke"
  ),
  setActiveSession: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.multiSession.setActive"
  ),
  setTheme: fn().mockName("theme.setTheme"),
  signInPasskey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signIn.passkey"
  ),
  updateApiKey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.apiKey.update"
  ),
  updatePasskey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.passkey.updatePasskey"
  )
}

const featureAuthClient = {
  ...(storyAuthClient as object),
  apiKey: {
    create: featureActions.createApiKey,
    delete: featureActions.deleteApiKey,
    list: async () => ({ data: apiKeys, error: null }),
    update: featureActions.updateApiKey
  },
  deleteUser: featureActions.deleteUser,
  multiSession: {
    listDeviceSessions: async () => ({ data: deviceSessions, error: null }),
    revoke: featureActions.revokeDeviceSession,
    setActive: featureActions.setActiveSession
  },
  passkey: {
    addPasskey: featureActions.addPasskey,
    deletePasskey: featureActions.deletePasskey,
    listUserPasskeys: async () => ({ data: passkeys, error: null }),
    updatePasskey: featureActions.updatePasskey
  },
  signIn: {
    ...(storyAuthClient as { signIn: object }).signIn,
    magicLink: featureActions.magicLink,
    passkey: featureActions.signInPasskey
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
  redirectTo = "/settings/account",
  width
}: {
  children: ReactNode
  plugins: AuthPlugin[]
  redirectTo?: string
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl" | "max-w-4xl"
}) {
  return (
    <AuthProvider
      authClient={featureAuthClient}
      baseURL="http://localhost:3000"
      navigate={storyActions.navigate}
      plugins={plugins}
      queryClient={createFeatureQueryClient()}
      redirectTo={redirectTo}
      socialProviders={["github", "google"]}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toast.Provider />
    </AuthProvider>
  )
}

function ThemePreview({ initialTheme }: { initialTheme: string }) {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    applyStoryTheme(initialTheme as StoryTheme)
  }, [initialTheme])

  const changeTheme = (nextTheme: string) => {
    featureActions.setTheme(nextTheme)
    applyStoryTheme(nextTheme as StoryTheme)
    setTheme(nextTheme)
  }

  return (
    <FeaturePreview plugins={[themePlugin({ setTheme: changeTheme, theme })]}>
      <Appearance />
    </FeaturePreview>
  )
}

type FeatureStoryArgs = {
  initialTheme?: string
  redirectTo?: string
  usernameAvailable?: boolean
}

const meta = {
  id: "heroui-plugins-feature-coverage",
  title: "HeroUI/Plugins/Core plugins",
  args: {
    initialTheme: "system",
    redirectTo: "/settings/account",
    usernameAvailable: true
  },
  argTypes: {
    initialTheme: {
      control: "inline-radio",
      options: ["system", "light", "dark"]
    },
    redirectTo: { control: "text" },
    usernameAvailable: { control: "boolean" }
  },
  parameters: { layout: "fullscreen" }
} satisfies Meta<FeatureStoryArgs>

export default meta

type Story = StoryObj<FeatureStoryArgs>

export const MagicLinkPreview: Story = {
  name: "Magic link",
  render: ({ redirectTo = "/settings/account" }) => (
    <FeaturePreview
      plugins={[magicLinkPlugin()]}
      redirectTo={redirectTo}
      width="max-w-md"
    >
      <MagicLink />
    </FeaturePreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("send a magic link", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Email" }),
        "ada@example.com"
      )
      await userEvent.click(
        canvas.getByRole("button", { name: "Send Magic Link" })
      )
      await expect(featureActions.magicLink).toHaveBeenCalled()
    })
  }
}

export const ApiKeysPreview: Story = {
  name: "API keys",
  render: () => (
    <FeaturePreview plugins={[apiKeyPlugin()]}>
      <ApiKeys />
    </FeaturePreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open the API key creator", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Create API key" })
      )
      await expect(
        await within(canvasElement.ownerDocument.body).findByRole("alertdialog")
      ).toBeInTheDocument()
    })
  }
}

export const PasskeysPreview: Story = {
  name: "Passkeys",
  render: () => (
    <FeaturePreview plugins={[passkeyPlugin()]}>
      <Passkeys />
    </FeaturePreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("start passkey registration", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Add passkey" }))
      await expect(canvas.getByText("MacBook Touch ID")).toBeVisible()
    })
  }
}

export const MultiSessionPreview: Story = {
  name: "Multiple sessions",
  render: () => (
    <FeaturePreview plugins={[multiSessionPlugin()]}>
      <ManageAccounts />
    </FeaturePreview>
  ),
  play: async ({ canvas, step }) => {
    await step("show every device session", async () => {
      await expect(
        canvas.getAllByRole("button", { name: "Sign Out" })
      ).toHaveLength(2)
    })
  }
}

export const DeleteUserPreview: Story = {
  name: "Delete user",
  render: () => (
    <FeaturePreview plugins={[deleteUserPlugin()]}>
      <DangerZone />
    </FeaturePreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open account deletion confirmation", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Delete account" })
      )
      await expect(
        within(canvasElement.ownerDocument.body).getByRole("alertdialog")
      ).toBeInTheDocument()
    })
  }
}

export const ThemePreviewStory: Story = {
  name: "Theme",
  render: ({ initialTheme = "system" }) => (
    <ThemePreview initialTheme={initialTheme} />
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("change the color theme", async () => {
      await userEvent.click(canvas.getByRole("radio", { name: /Dark/ }))
      await expect(featureActions.setTheme).toHaveBeenCalledWith("dark")
      await expect(canvasElement.ownerDocument.documentElement).toHaveClass(
        "dark"
      )
    })
  }
}

export const UsernameSignInPreview: Story = {
  name: "Username sign in",
  render: ({ redirectTo = "/settings/account", usernameAvailable = true }) => (
    <FeaturePreview
      plugins={[usernamePlugin({ isUsernameAvailable: usernameAvailable })]}
      redirectTo={redirectTo}
      width="max-w-md"
    >
      <SignInUsername />
    </FeaturePreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("sign in with a username", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Username" }),
        "ada"
      )
      await userEvent.type(
        canvas.getByLabelText("Password"),
        "storybook-password"
      )
      await userEvent.click(canvas.getByRole("button", { name: "Sign In" }))
      await expect(storyActions.signInUsername).toHaveBeenCalledWith(
        expect.objectContaining({ username: "ada" })
      )
    })
  }
}

export const UsernameProfilePreview: Story = {
  name: "Username profile",
  render: ({ usernameAvailable = true }) => (
    <FeaturePreview
      plugins={[usernamePlugin({ isUsernameAvailable: usernameAvailable })]}
    >
      <UserProfile />
    </FeaturePreview>
  ),
  play: async ({ canvas, step }) => {
    await step("render username profile fields", async () => {
      await expect(
        canvas.getByRole("heading", { name: "User profile" })
      ).toBeVisible()
    })
  }
}
