import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { expect } from "storybook/test"

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
  storyActions,
  storyAuthClient
} from "../support/story-fixtures"

type SettingsStoryArgs = {
  multipleAccountsPerProvider: boolean
  redirectTo: string
  socialProviders: ("github" | "google")[]
}

function SettingsPreview({
  children,
  multipleAccountsPerProvider = false,
  redirectTo = "/settings/account",
  socialProviders = ["github", "google"]
}: Partial<SettingsStoryArgs> & { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={storyAuthClient}
      Link={StoryLink}
      multipleAccountsPerProvider={multipleAccountsPerProvider}
      navigate={storyActions.navigate}
      queryClient={createStoryQueryClient()}
      redirectTo={redirectTo}
      socialProviders={socialProviders}
    >
      <StoryShell>{children}</StoryShell>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  id: "shadcn-ui-components-settings",
  title: "shadcn/Components/Account settings",
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
  parameters: { layout: "fullscreen" }
} satisfies Meta<SettingsStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const SettingsPreviewStory: Story = {
  name: "Settings",
  render: (args) => (
    <SettingsPreview {...args}>
      <Settings view="account" />
    </SettingsPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("render account settings", async () => {
      await expect(canvas.getByText("User profile")).toBeVisible()
    })
  }
}

export const AccountSettingsPreview: Story = {
  name: "Account settings",
  render: (args) => (
    <SettingsPreview {...args}>
      <AccountSettings />
    </SettingsPreview>
  ),
  play: SettingsPreviewStory.play
}

export const UserProfilePreview: Story = {
  name: "User profile",
  render: (args) => (
    <SettingsPreview {...args}>
      <UserProfile />
    </SettingsPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("update the profile name", async () => {
      const name = canvas.getByRole("textbox", { name: "Name" })
      await userEvent.clear(name)
      await userEvent.type(name, "Ada Byron")
      await expect(name).toHaveValue("Ada Byron")
    })
  }
}

export const ChangeEmailPreview: Story = {
  name: "Change email",
  render: (args) => (
    <SettingsPreview {...args}>
      <ChangeEmail />
    </SettingsPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("change the account email", async () => {
      await userEvent.clear(canvas.getByRole("textbox", { name: "Email" }))
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Email" }),
        "ada+storybook@example.com"
      )
      await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveValue(
        "ada+storybook@example.com"
      )
    })
  }
}

export const SecuritySettingsPreview: Story = {
  name: "Security settings",
  render: (args) => (
    <SettingsPreview {...args}>
      <SecuritySettings />
    </SettingsPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("render security settings", async () => {
      await expect(canvas.getByText("Change password")).toBeVisible()
    })
  }
}

export const ChangePasswordPreview: Story = {
  name: "Change password",
  render: (args) => (
    <SettingsPreview {...args}>
      <ChangePassword />
    </SettingsPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("change the account password", async () => {
      await userEvent.type(
        canvas.getByLabelText("Current password"),
        "current-password"
      )
      await userEvent.type(
        canvas.getByLabelText("New password"),
        "new-storybook-password"
      )
      await userEvent.click(
        canvas.getByRole("button", { name: "Update password" })
      )
      await expect(storyActions.changePassword).toHaveBeenCalled()
    })
  }
}

export const LinkedAccountsPreview: Story = {
  name: "Linked accounts",
  render: (args) => (
    <SettingsPreview {...args}>
      <LinkedAccounts />
    </SettingsPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("link another social account", async () => {
      await expect(canvas.getByText("ada-lovelace")).toBeVisible()
      await userEvent.click(
        canvas.getByRole("button", { name: "Link your Google account" })
      )
      await expect(storyActions.linkSocial).toHaveBeenCalled()
    })
  }
}

export const ActiveSessionsPreview: Story = {
  name: "Active sessions",
  render: (args) => (
    <SettingsPreview {...args}>
      <ActiveSessions />
    </SettingsPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("show every active session", async () => {
      await expect(
        canvas.getAllByRole("button", { name: "Sign Out" })
      ).toHaveLength(2)
    })
  }
}
