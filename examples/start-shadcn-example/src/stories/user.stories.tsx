import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { UserAvatar } from "@/components/auth/user/user-avatar"
import { UserButton } from "@/components/auth/user/user-button"
import { UserView } from "@/components/auth/user/user-view"
import { Toaster } from "@/components/ui/sonner"

import {
  createStoryQueryClient,
  StoryLink,
  StoryShell,
  storyAuthClient,
  storySession
} from "./story-fixtures"

function UserPreview({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={storyAuthClient}
      Link={StoryLink}
      navigate={() => undefined}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
    >
      <StoryShell width="max-w-md">{children}</StoryShell>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  title: "shadcn/ui/Components/User",
  parameters: { layout: "fullscreen" }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const UserAvatarPreview: Story = {
  name: "User avatar",
  render: () => (
    <UserPreview>
      <UserAvatar user={storySession.user} />
    </UserPreview>
  )
}

export const UserButtonPreview: Story = {
  name: "User button",
  render: () => (
    <UserPreview>
      <UserButton />
    </UserPreview>
  )
}

export const UserButtonIconPreview: Story = {
  name: "User button, icon",
  render: () => (
    <UserPreview>
      <UserButton size="icon" />
    </UserPreview>
  )
}

export const UserButtonLinksPreview: Story = {
  name: "User button, custom links",
  render: () => (
    <UserPreview>
      <UserButton
        links={[
          {
            href: "/dashboard",
            label: "Dashboard",
            visibility: "authenticated"
          },
          { href: "/team", label: "Team" }
        ]}
      />
    </UserPreview>
  )
}

export const UserViewPreview: Story = {
  name: "User view",
  render: () => (
    <UserPreview>
      <UserView user={storySession.user} />
    </UserPreview>
  )
}
