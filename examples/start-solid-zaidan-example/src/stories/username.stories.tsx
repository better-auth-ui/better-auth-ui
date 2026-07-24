import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/solid-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/solid-router"
import type { Component } from "solid-js"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AuthProvider } from "@/components/auth/auth-provider"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import { SignIn } from "@/components/auth/sign-in"
import { SignUp } from "@/components/auth/sign-up"
import { usernamePlugin } from "@/lib/auth/username-plugin"

const userId = "user_username_docs"

const sessionData = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_username_docs",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId
  },
  user: {
    email: "ada@example.com",
    emailVerified: true,
    id: userId,
    image: null,
    name: "Ada Lovelace",
    username: "ada"
  }
}

const mockAuthClient = {
  isUsernameAvailable: async ({ username }: { username: string }) => ({
    data: { available: username.toLowerCase() !== "taken" },
    error: null
  }),
  signIn: {
    email: async () => ({ data: sessionData, error: null }),
    username: async () => ({ data: sessionData, error: null })
  },
  signUp: {
    email: async () => ({ data: sessionData, error: null })
  },
  updateUser: async () => ({ data: sessionData.user, error: null })
} as never

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

function UsernameStoryProvider(props: { component: Component }) {
  const Preview = props.component

  return (
    <AuthProvider
      authClient={mockAuthClient}
      localization={{ settings: { userProfile: "User Profile" } }}
      plugins={[usernamePlugin({ isUsernameAvailable: true })]}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
    >
      {() => (
        <main class="flex min-h-[360px] w-full items-center justify-center bg-background p-6 text-foreground">
          <Preview />
        </main>
      )}
    </AuthProvider>
  )
}

function createStoryRouter(component: Component) {
  const rootRoute = createRootRoute({
    component: () => <UsernameStoryProvider component={component} />
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <UsernameStoryProvider component={component} />
  })

  return createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree: rootRoute.addChildren([indexRoute])
  })
}

function SignInPreviewContent() {
  return <SignIn />
}

function SignUpPreviewContent() {
  return <SignUp />
}

function UserProfilePreviewContent() {
  return <UserProfile class="w-full" />
}

const meta = {
  title: "Zaidan/Plugins/Username",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const SignInPreview: Story = {
  render: () => (
    <RouterProvider router={createStoryRouter(SignInPreviewContent)} />
  )
}

export const SignUpPreview: Story = {
  render: () => (
    <RouterProvider router={createStoryRouter(SignUpPreviewContent)} />
  )
}

export const UserProfilePreview: Story = {
  render: () => (
    <RouterProvider router={createStoryRouter(UserProfilePreviewContent)} />
  )
}
