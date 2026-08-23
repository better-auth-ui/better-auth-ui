import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { AccountSettings } from "@/components/auth/settings/account/account-settings"
import { ChangeEmail } from "@/components/auth/settings/account/change-email"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import { ActiveSessions } from "@/components/auth/settings/security/active-sessions"
import { ChangePassword } from "@/components/auth/settings/security/change-password"
import { LinkedAccounts } from "@/components/auth/settings/security/linked-accounts"
import { SecuritySettings } from "@/components/auth/settings/security/security-settings"
import { Settings } from "@/components/auth/settings/settings"
import { Toaster } from "@/components/ui/sonner"

import {
  createStoryQueryClient,
  StoryLink,
  StoryShell,
  storyAuthClient
} from "./story-fixtures"

function SettingsPreview({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={storyAuthClient}
      Link={StoryLink}
      multipleAccountsPerProvider={false}
      navigate={() => undefined}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <StoryShell>{children}</StoryShell>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  title: "shadcn/ui/Components/Settings",
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
