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
import { Appearance } from "@/components/auth/theme/appearance"
import { UserButton } from "@/components/auth/user/user-button"
import { themePlugin } from "@/lib/auth/theme-plugin"

const mockAuthClient = {} as never

const sessionData = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_theme_docs",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId: "user_theme_docs"
  },
  user: {
    email: "ada@example.com",
    emailVerified: true,
    id: "user_theme_docs",
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

function ThemeStoryProvider(props: { children: () => JSX.Element }) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      plugins={[themePlugin()]}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
    >
      {props.children}
    </AuthProvider>
  )
}

function UserButtonPreviewContent() {
  return (
    <ThemeStoryProvider>
      {() => (
        <main class="flex min-h-[260px] w-full items-center justify-center bg-background p-10 text-foreground">
          <UserButton />
        </main>
      )}
    </ThemeStoryProvider>
  )
}

const rootRoute = createRootRoute({
  component: UserButtonPreviewContent
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: UserButtonPreviewContent
})

const routeTree = rootRoute.addChildren([indexRoute])

function UserButtonPreviewStory() {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree
  })

  return <RouterProvider router={router} />
}

function AppearancePreviewStory() {
  return (
    <ThemeStoryProvider>
      {() => (
        <main class="flex min-h-[360px] w-full items-center justify-center bg-background p-10 text-foreground">
          <div class="w-full max-w-3xl">
            <Appearance />
          </div>
        </main>
      )}
    </ThemeStoryProvider>
  )
}

const meta = {
  title: "Zaidan/Plugins/Theme",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const UserButtonPreview: Story = {
  render: () => <UserButtonPreviewStory />
}

export const AppearancePreview: Story = {
  render: () => <AppearancePreviewStory />
}
