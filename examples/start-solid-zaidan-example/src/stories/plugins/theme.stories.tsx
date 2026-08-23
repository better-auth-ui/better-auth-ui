import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/solid-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/solid-router"
import { createEffect, type JSX } from "solid-js"
import { expect } from "storybook/test"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Appearance } from "@/components/auth/theme/appearance"
import { UserButton } from "@/components/auth/user/user-button"
import { themePlugin } from "@/lib/auth/theme-plugin"
import { storyRenders, withStoryActions } from "../support/story-coverage"
import { applyStoryTheme, type StoryTheme } from "../support/story-theme"

const mockAuthClient = {} as never
const setTheme = withStoryActions(
  (theme: string) => applyStoryTheme(theme as StoryTheme),
  "theme.setTheme"
)

type ThemeStoryArgs = {
  theme?: string
  themes?: string[]
}

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

function ThemeStoryProvider(
  props: ThemeStoryArgs & { children: () => JSX.Element }
) {
  createEffect(() => applyStoryTheme((props.theme ?? "system") as StoryTheme))

  return (
    <AuthProvider
      authClient={mockAuthClient}
      plugins={[
        themePlugin({
          setTheme,
          theme: props.theme ?? "system",
          themes: props.themes ?? ["system", "light", "dark"]
        })
      ]}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
    >
      {props.children}
    </AuthProvider>
  )
}

function UserButtonPreviewContent(props: ThemeStoryArgs) {
  return (
    <ThemeStoryProvider {...props}>
      {() => (
        <main class="flex min-h-[260px] w-full items-center justify-center bg-background p-10 text-foreground">
          <UserButton />
        </main>
      )}
    </ThemeStoryProvider>
  )
}

function UserButtonPreviewStory(props: ThemeStoryArgs) {
  const component = () => <UserButtonPreviewContent {...props} />
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

function AppearancePreviewStory(props: ThemeStoryArgs) {
  return (
    <ThemeStoryProvider {...props}>
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
  args: {
    theme: "system",
    themes: ["system", "light", "dark"]
  },
  argTypes: {
    theme: {
      control: "inline-radio",
      options: ["system", "light", "dark"]
    },
    themes: {
      control: "check",
      options: ["system", "light", "dark"]
    }
  },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<ThemeStoryArgs>

export default meta

type Story = StoryObj<ThemeStoryArgs>

export const UserButtonPreview: Story = {
  play: storyRenders,
  render: (args) => <UserButtonPreviewStory {...args} />
}

export const AppearancePreview: Story = {
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("change the color theme", async () => {
      await userEvent.click(canvas.getByRole("radio", { name: /Dark/ }))
      await expect(setTheme).toHaveBeenCalledWith("dark")
      await expect(canvasElement.ownerDocument.documentElement).toHaveClass(
        "dark"
      )
    })
  },
  render: (args) => <AppearancePreviewStory {...args} />
}
