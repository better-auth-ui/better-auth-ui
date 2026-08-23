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
import { storyRenders, withStoryActions } from "../support/story-coverage"

const mockAuthClient = withStoryActions(
  {
    signIn: {
      magicLink: async () => ({ data: null, error: null }),
      social: async () => ({ data: null, error: null })
    }
  },
  "authClient"
) as unknown as MagicLinkAuthClient

function MagicLinkPreview(props: { redirectTo?: string }) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      baseURL="http://localhost:3000"
      plugins={[magicLinkPlugin()]}
      redirectTo={props.redirectTo ?? "/settings/account"}
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

function MagicLinkStory(props: { redirectTo?: string }) {
  const component = () => <MagicLinkPreview redirectTo={props.redirectTo} />
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
  title: "Zaidan/Plugins/Magic Link",
  component: MagicLinkStory,
  args: { redirectTo: "/settings/account" },
  argTypes: { redirectTo: { control: "text" } },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof MagicLinkStory>

export default meta

type Story = StoryObj<typeof meta>

export const Preview: Story = { play: storyRenders }
