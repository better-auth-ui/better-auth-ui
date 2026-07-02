import { authQueryKeys } from "@better-auth-ui/core"
import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session"
import { multiSessionQueryKeys } from "@better-auth-ui/core/plugins/multi-session"
import { QueryClient } from "@tanstack/solid-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/solid-router"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ManageAccounts } from "@/components/auth/multi-session/manage-accounts"
import { UserButton } from "@/components/auth/user/user-button"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"

const userId = "user_multi_session_docs"

const mockAuthClient = {
  multiSession: {
    listDeviceSessions: async () => ({
      data: deviceSessions,
      error: null
    }),
    revoke: async () => ({ data: null, error: null }),
    setActive: async () => ({ data: null, error: null })
  }
} as unknown as MultiSessionAuthClient

const sessionData = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_current_docs",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId
  },
  user: {
    email: "ada@example.com",
    emailVerified: true,
    id: userId,
    image: null,
    name: "Ada Lovelace"
  }
}

const deviceSessions = [
  sessionData,
  {
    session: {
      createdAt: new Date("2026-01-12T08:10:00Z"),
      expiresAt: new Date("2026-01-12T11:30:00Z"),
      id: "session_other_docs",
      token: "",
      updatedAt: new Date("2026-01-12T08:10:00Z"),
      userId
    },
    user: {
      email: "ada+tablet@example.com",
      emailVerified: true,
      id: userId,
      image: null,
      name: "Ada Lovelace"
    }
  }
]

function createStoryQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, sessionData)
  queryClient.setQueryData(multiSessionQueryKeys.list(userId), deviceSessions)

  return queryClient
}

function ManageAccountsPreviewStory() {
  const queryClient = createStoryQueryClient()

  return (
    <AuthProvider
      authClient={mockAuthClient}
      plugins={[multiSessionPlugin()]}
      queryClient={queryClient}
    >
      {() => (
        <main class="mx-auto flex min-h-[420px] w-full max-w-xl items-center justify-center bg-background p-6 text-foreground">
          <ManageAccounts />
        </main>
      )}
    </AuthProvider>
  )
}

function SwitchAccountPreviewContent() {
  const queryClient = createStoryQueryClient()

  return (
    <AuthProvider
      authClient={mockAuthClient}
      plugins={[multiSessionPlugin()]}
      queryClient={queryClient}
    >
      {() => (
        <main class="mx-auto flex min-h-[420px] w-full max-w-xl items-center justify-center bg-background p-6 text-foreground">
          <UserButton />
        </main>
      )}
    </AuthProvider>
  )
}

const rootRoute = createRootRoute({
  component: SwitchAccountPreviewContent
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SwitchAccountPreviewContent
})

const routeTree = rootRoute.addChildren([indexRoute])

function SwitchAccountPreviewStory() {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree
  })

  return <RouterProvider router={router} />
}

const meta = {
  title: "Zaidan/Plugins/Multi Session",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const ManageAccountsPreview: Story = {
  render: () => <ManageAccountsPreviewStory />
}

export const SwitchAccountPreview: Story = {
  render: () => <SwitchAccountPreviewStory />
}
