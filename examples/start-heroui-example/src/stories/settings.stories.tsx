import {
  AccountSettings,
  ActiveSessions,
  AuthProvider,
  ChangeEmail,
  ChangePassword,
  LinkedAccounts,
  SecuritySettings,
  Settings,
  UserProfile
} from "@better-auth-ui/heroui"
import { Toast } from "@heroui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

import {
  createStoryQueryClient,
  StoryShell,
  storyAuthClient
} from "./story-fixtures"

function SettingsPreview({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={storyAuthClient}
      multipleAccountsPerProvider={false}
      navigate={() => undefined}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <StoryShell>{children}</StoryShell>
      <Toast.Provider />
    </AuthProvider>
  )
}

const meta = {
  title: "HeroUI/Components/Settings",
  parameters: { layout: "fullscreen" }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const SettingsPreviewStory: Story = {
  name: "Settings",
  render: () => (
    <SettingsPreview>
      <Settings view="account" />
    </SettingsPreview>
  )
}

export const AccountSettingsPreview: Story = {
  name: "Account settings",
  render: () => (
    <SettingsPreview>
      <AccountSettings />
    </SettingsPreview>
  )
}

export const UserProfilePreview: Story = {
  name: "User profile",
  render: () => (
    <SettingsPreview>
      <UserProfile />
    </SettingsPreview>
  )
}

export const ChangeEmailPreview: Story = {
  name: "Change email",
  render: () => (
    <SettingsPreview>
      <ChangeEmail />
    </SettingsPreview>
  )
}

export const SecuritySettingsPreview: Story = {
  name: "Security settings",
  render: () => (
    <SettingsPreview>
      <SecuritySettings />
    </SettingsPreview>
  )
}

export const ChangePasswordPreview: Story = {
  name: "Change password",
  render: () => (
    <SettingsPreview>
      <ChangePassword />
    </SettingsPreview>
  )
}

export const LinkedAccountsPreview: Story = {
  name: "Linked accounts",
  render: () => (
    <SettingsPreview>
      <LinkedAccounts />
    </SettingsPreview>
  )
}

export const ActiveSessionsPreview: Story = {
  name: "Active sessions",
  render: () => (
    <SettingsPreview>
      <ActiveSessions />
    </SettingsPreview>
  )
}
