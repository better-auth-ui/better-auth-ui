import { authQueryKeys } from "@better-auth-ui/core"
import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { passkeyQueryKeys } from "@better-auth-ui/core/plugins/passkey"
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
import { PasskeysSettings } from "@/components/auth/passkey/passkeys"
import type { ListedPasskey } from "@/components/auth/settings/shared/types"
import { SignIn } from "@/components/auth/sign-in"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"

const userId = "user_passkey_docs"

const passkeys = [
  {
    id: "passkey_docs",
    name: "",
    createdAt: new Date("2026-05-22T02:57:00Z")
  }
] satisfies ListedPasskey[]

const sessionData = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_passkey_docs",
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

const listPasskeys = async () => ({ data: passkeys, error: null })
const addPasskey = async () => ({ data: null, error: null })
const deletePasskey = async () => ({ data: null, error: null })

const mockAuthClient = {
  passkey: {
    addPasskey,
    deletePasskey,
    listUserPasskeys: listPasskeys
  },
  signIn: {
    passkey: async () => ({ data: null, error: null })
  }
} as unknown as PasskeyAuthClient

function createStoryQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, sessionData)
  queryClient.setQueryData(passkeyQueryKeys.list(userId), passkeys)

  return queryClient
}

function createStoryRouter(component: () => JSX.Element) {
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

function PasskeySignInPreviewContent() {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      plugins={[passkeyPlugin()]}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      {() => (
        <main class="flex min-h-[680px] w-full items-center justify-center bg-background p-10 text-foreground">
          <SignIn />
        </main>
      )}
    </AuthProvider>
  )
}

function PasskeysPreviewStory() {
  const queryClient = createStoryQueryClient()

  return (
    <AuthProvider
      authClient={mockAuthClient}
      plugins={[passkeyPlugin()]}
      queryClient={queryClient}
      redirectTo="/settings/account"
    >
      {() => (
        <main class="flex min-h-[360px] w-full items-center justify-center bg-background p-10 text-foreground">
          <div class="w-full">
            <PasskeysSettings />
          </div>
        </main>
      )}
    </AuthProvider>
  )
}

const meta = {
  title: "Zaidan/Plugins/Passkey",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const PasskeySignInPreview: Story = {
  render: () => (
    <RouterProvider router={createStoryRouter(PasskeySignInPreviewContent)} />
  )
}

export const PasskeysPreview: Story = {
  render: () => <PasskeysPreviewStory />
}
