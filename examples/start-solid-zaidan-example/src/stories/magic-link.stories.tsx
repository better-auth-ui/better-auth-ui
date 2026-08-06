import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/solid-router"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AuthProvider } from "@/components/auth/auth-provider"
import { MagicLink } from "@/components/auth/magic-link"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"

const mockAuthClient = {
  signIn: {
    magicLink: async () => ({ data: null, error: null }),
    social: async () => ({ data: null, error: null })
  }
} as unknown as MagicLinkAuthClient

function MagicLinkPreview() {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      baseURL="http://localhost:3000"
      plugins={[magicLinkPlugin()]}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      {() => (
        <main class="mx-auto flex min-h-[420px] w-full max-w-xl items-center justify-center bg-background p-6 text-foreground">
          <MagicLink />
        </main>
      )}
    </AuthProvider>
  )
}

const rootRoute = createRootRoute({
  component: MagicLinkPreview
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MagicLinkPreview
})

const routeTree = rootRoute.addChildren([indexRoute])

function MagicLinkStory() {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree
  })

  return <RouterProvider router={router} />
}

const meta = {
  title: "Zaidan/Plugins/Magic Link",
  component: MagicLinkStory,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof MagicLinkStory>

export default meta

type Story = StoryObj<typeof meta>

export const Preview: Story = {}
