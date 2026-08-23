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
import { UserAvatar } from "@/components/auth/user/user-avatar"
import { UserButton } from "@/components/auth/user/user-button"
import { UserView } from "@/components/auth/user/user-view"
import { storyRenders } from "../support/story-coverage"

const mockAuthClient = {} as never

const sessionData = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_user_docs",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId: "user_docs"
  },
  user: {
    email: "ada@example.com",
    emailVerified: true,
    id: "user_docs",
    image: null,
    name: "Ada Lovelace"
  }
}

function createStoryQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, sessionData)

  return queryClient
}

function UserStoryProvider(props: { children: () => JSX.Element }) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
    >
      {props.children}
    </AuthProvider>
  )
}

function UserPreviewShell(props: { children: JSX.Element }) {
  return (
    <main class="flex min-h-[260px] w-full items-center justify-center bg-background p-10 text-foreground">
      {props.children}
    </main>
  )
}

function UserButtonPreviewContent(props: { size?: "default" | "icon" }) {
  return (
    <UserStoryProvider>
      {() => (
        <UserPreviewShell>
          <UserButton size={props.size} />
        </UserPreviewShell>
      )}
    </UserStoryProvider>
  )
}

type UserStoryArgs = {
  avatarInitials?: string
  dashboardLabel?: string
  teamLabel?: string
}

function UserButtonLinksPreviewContent(props: UserStoryArgs) {
  return (
    <UserStoryProvider>
      {() => (
        <UserPreviewShell>
          <UserButton
            links={[
              {
                href: "/dashboard",
                label: <span>{props.dashboardLabel ?? "Dashboard"}</span>,
                visibility: "authenticated"
              },
              {
                href: "/team",
                label: <span>{props.teamLabel ?? "Team"}</span>
              }
            ]}
          />
        </UserPreviewShell>
      )}
    </UserStoryProvider>
  )
}

function createUserButtonRouter(component: () => JSX.Element) {
  const rootRoute = createRootRoute({ component })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component
  })

  return createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree: rootRoute.addChildren([indexRoute])
  })
}

function UserButtonPreviewStory() {
  return (
    <RouterProvider
      router={createUserButtonRouter(() => <UserButtonPreviewContent />)}
    />
  )
}

function UserButtonIconPreviewStory() {
  return (
    <RouterProvider
      router={createUserButtonRouter(() => (
        <UserButtonPreviewContent size="icon" />
      ))}
    />
  )
}

function UserButtonLinksPreviewStory(props: UserStoryArgs) {
  return (
    <RouterProvider
      router={createUserButtonRouter(() => (
        <UserButtonLinksPreviewContent {...props} />
      ))}
    />
  )
}

const meta = {
  id: "zaidan-components-user",
  title: "Zaidan/Components/User",
  args: {
    avatarInitials: "AL",
    dashboardLabel: "Dashboard",
    teamLabel: "Team"
  },
  argTypes: {
    avatarInitials: { control: "text" },
    dashboardLabel: { control: "text" },
    teamLabel: { control: "text" }
  },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<UserStoryArgs>

export default meta

type Story = StoryObj<UserStoryArgs>

export const UserAvatarPreview: Story = {
  play: storyRenders,
  render: ({ avatarInitials = "AL" }) => (
    <UserStoryProvider>
      {() => (
        <UserPreviewShell>
          <UserAvatar label="Ada Lovelace" initials={avatarInitials} />
        </UserPreviewShell>
      )}
    </UserStoryProvider>
  )
}

export const UserButtonPreview: Story = {
  play: storyRenders,
  render: () => <UserButtonPreviewStory />
}

export const UserButtonIconPreview: Story = {
  play: storyRenders,
  render: () => <UserButtonIconPreviewStory />
}

export const UserButtonLinksPreview: Story = {
  play: storyRenders,
  render: (args) => <UserButtonLinksPreviewStory {...args} />
}

export const UserViewPreview: Story = {
  play: storyRenders,
  render: () => (
    <UserStoryProvider>
      {() => (
        <UserPreviewShell>
          <UserView label="Ada Lovelace" secondaryLabel="ada@example.com" />
        </UserPreviewShell>
      )}
    </UserStoryProvider>
  )
}
