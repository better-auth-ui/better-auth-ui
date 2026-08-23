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
import { storyRenders, withStoryActions } from "../support/story-coverage"

const userId = "user_multi_session_docs"

const mockAuthClient = withStoryActions(
  {
    multiSession: {
      listDeviceSessions: async () => ({
        data: deviceSessions,
        error: null
      }),
      revoke: async () => ({ data: null, error: null }),
      setActive: async () => ({ data: null, error: null })
    }
  },
  "authClient"
) as unknown as MultiSessionAuthClient

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

function createStoryQueryClient(showTabletSession = true) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, sessionData)
  queryClient.setQueryData(
    multiSessionQueryKeys.list(userId),
    showTabletSession ? deviceSessions : [sessionData]
  )

  return queryClient
}

function ManageAccountsPreviewStory(props: { showTabletSession?: boolean }) {
  const queryClient = createStoryQueryClient(props.showTabletSession)

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

function SwitchAccountPreviewContent(props: { showTabletSession?: boolean }) {
  const queryClient = createStoryQueryClient(props.showTabletSession)

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

function SwitchAccountPreviewStory(props: { showTabletSession?: boolean }) {
  const component = () => <SwitchAccountPreviewContent {...props} />
  const rootRoute = createRootRoute({ component })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component
  })
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree: rootRoute.addChildren([indexRoute])
  })

  return <RouterProvider router={router} />
}

const meta = {
  title: "Zaidan/Plugins/Multi Session",
  args: { showTabletSession: true },
  argTypes: { showTabletSession: { control: "boolean" } },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<{ showTabletSession?: boolean }>

export default meta

type Story = StoryObj<{ showTabletSession?: boolean }>

export const ManageAccountsPreview: Story = {
  play: storyRenders,
  render: (args) => <ManageAccountsPreviewStory {...args} />
}

export const SwitchAccountPreview: Story = {
  play: storyRenders,
  render: (args) => <SwitchAccountPreviewStory {...args} />
}
