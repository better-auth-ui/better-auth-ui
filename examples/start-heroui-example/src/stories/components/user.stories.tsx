import {
  AuthProvider,
  UserAvatar,
  UserButton,
  UserView
} from "@better-auth-ui/heroui"
import { Toast } from "@heroui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { expect } from "storybook/test"

import {
  createStoryQueryClient,
  StoryShell,
  storyActions,
  storyAuthClient,
  storySession
} from "../support/story-fixtures"

type UserStoryArgs = {
  dashboardLabel?: string
  redirectTo?: string
  teamLabel?: string
}

function UserPreview({
  children,
  redirectTo = "/settings/account"
}: Partial<UserStoryArgs> & { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={storyAuthClient}
      navigate={storyActions.navigate}
      queryClient={createStoryQueryClient()}
      redirectTo={redirectTo}
    >
      <StoryShell width="max-w-md">{children}</StoryShell>
      <Toast.Provider />
    </AuthProvider>
  )
}

const meta = {
  id: "heroui-components-user",
  title: "HeroUI/Components/User",
  args: {
    dashboardLabel: "Dashboard",
    redirectTo: "/settings/account",
    teamLabel: "Team"
  },
  argTypes: {
    dashboardLabel: { control: "text" },
    redirectTo: { control: "text" },
    teamLabel: { control: "text" }
  },
  parameters: { layout: "fullscreen" }
} satisfies Meta<UserStoryArgs>

export default meta

type Story = StoryObj<UserStoryArgs>

export const UserAvatarPreview: Story = {
  name: "User avatar",
  render: (args) => (
    <UserPreview {...args}>
      <UserAvatar user={storySession.user} />
    </UserPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("render the user initials", async () => {
      await expect(canvas.getByText("AD")).toBeVisible()
    })
  }
}

export const UserButtonPreview: Story = {
  name: "User button",
  render: (args) => (
    <UserPreview {...args}>
      <UserButton />
    </UserPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("open the user menu", async () => {
      const trigger = canvas.getByRole("button", { name: /Ada Lovelace/ })
      await userEvent.click(trigger)
      await expect(trigger).toHaveAttribute("aria-expanded", "true")
    })
  }
}

export const UserButtonIconPreview: Story = {
  name: "User button, icon",
  render: (args) => (
    <UserPreview {...args}>
      <UserButton size="icon" />
    </UserPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("open the icon user menu", async () => {
      const trigger = canvas.getByRole("button", { name: "AD" })
      await userEvent.click(trigger)
      await expect(trigger).toHaveAttribute("aria-expanded", "true")
    })
  }
}

export const UserButtonLinksPreview: Story = {
  name: "User button, custom links",
  render: ({ dashboardLabel = "Dashboard", teamLabel = "Team", ...args }) => (
    <UserPreview {...args}>
      <UserButton
        links={[
          {
            href: "/dashboard",
            label: dashboardLabel,
            visibility: "authenticated"
          },
          { href: "/team", label: teamLabel }
        ]}
      />
    </UserPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("show custom user links", async () => {
      const trigger = canvas.getByRole("button", { name: /Ada Lovelace/ })
      await userEvent.click(trigger)
      await expect(trigger).toHaveAttribute("aria-expanded", "true")
    })
  }
}

export const UserViewPreview: Story = {
  name: "User view",
  render: (args) => (
    <UserPreview {...args}>
      <UserView user={storySession.user} />
    </UserPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("render user identity", async () => {
      await expect(canvas.getByText("Ada Lovelace")).toBeVisible()
      await expect(canvas.getByText("ada@example.com")).toBeVisible()
    })
  }
}
