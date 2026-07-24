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

function UserButtonLinksPreviewContent() {
  return (
    <UserStoryProvider>
      {() => (
        <UserPreviewShell>
          <UserButton
            links={[
              {
                href: "/dashboard",
                label: <span>Dashboard</span>,
                visibility: "authenticated"
              },
              { href: "/team", label: <span>Team</span> }
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

function UserButtonLinksPreviewStory() {
  return (
    <RouterProvider
      router={createUserButtonRouter(UserButtonLinksPreviewContent)}
    />
  )
}

const meta = {
  title: "Zaidan/Components/User",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const UserAvatarPreview: Story = {
  render: () => (
    <UserStoryProvider>
      {() => (
        <UserPreviewShell>
          <UserAvatar label="Ada Lovelace" initials="AL" />
        </UserPreviewShell>
      )}
    </UserStoryProvider>
  )
}

export const UserButtonPreview: Story = {
  render: () => <UserButtonPreviewStory />
}

export const UserButtonIconPreview: Story = {
  render: () => <UserButtonIconPreviewStory />
}

export const UserButtonLinksPreview: Story = {
  render: () => <UserButtonLinksPreviewStory />
}

export const UserViewPreview: Story = {
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
