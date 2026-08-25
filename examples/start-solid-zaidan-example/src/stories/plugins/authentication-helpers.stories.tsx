import { authQueryKeys } from "@better-auth-ui/core"
import type { AdminAuthClient } from "@better-auth-ui/core/plugins/admin"
import type { AuthPlugin } from "@better-auth-ui/solid"
import {
  type CaptchaRenderProps,
  captchaPlugin
} from "@better-auth-ui/solid/plugins/captcha"
import { oneTapPlugin } from "@better-auth-ui/solid/plugins/one-tap"
import { QueryClient } from "@tanstack/solid-query"
import { createSignal, type JSX, onCleanup, onMount } from "solid-js"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { Admin } from "@/components/auth/admin/admin"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SignIn } from "@/components/auth/sign-in"
import { Button } from "@/components/ui/button"
import { adminPlugin } from "@/lib/auth/admin-plugin"
import { lastLoginMethodPlugin } from "@/lib/auth/last-login-method-plugin"
import { storyRenders, withStoryActions } from "../support/story-coverage"

const storyUserId = "user_plugin_coverage"
const storySession = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-12-12T10:30:00Z"),
    id: "session_plugin_coverage",
    token: "",
    updatedAt: new Date("2026-08-23T08:15:00Z"),
    userId: storyUserId
  },
  user: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    email: "ada@example.com",
    emailVerified: true,
    id: storyUserId,
    image: null,
    name: "Ada Lovelace",
    role: "admin",
    updatedAt: new Date("2026-08-23T08:15:00Z")
  }
}

const adminUsers = [
  { ...storySession.user, banned: false },
  {
    banned: false,
    createdAt: new Date("2026-02-18T14:00:00Z"),
    email: "grace@example.com",
    emailVerified: true,
    id: "user_admin_grace",
    image: null,
    name: "Grace Hopper",
    role: "user",
    updatedAt: new Date("2026-08-21T11:45:00Z")
  },
  {
    banReason: "Repeated policy violations",
    banned: true,
    createdAt: new Date("2026-03-04T09:20:00Z"),
    email: "alan@example.com",
    emailVerified: false,
    id: "user_admin_alan",
    image: null,
    name: "Alan Turing",
    role: "user",
    updatedAt: new Date("2026-08-20T16:10:00Z")
  }
]

const pluginAuthClient = withStoryActions(
  {
    admin: {
      banUser: async () => ({ data: null, error: null }),
      createUser: async () => ({ data: { user: adminUsers[1] }, error: null }),
      getUser: async ({ query }: { query: { id: string } }) => ({
        data: adminUsers.find((user) => user.id === query.id) ?? adminUsers[0],
        error: null
      }),
      hasPermission: async () => ({ data: { success: true }, error: null }),
      impersonateUser: async () => ({ data: null, error: null }),
      listUserSessions: async () => ({ data: { sessions: [] }, error: null }),
      listUsers: async () => ({
        data: { users: adminUsers, total: adminUsers.length },
        error: null
      }),
      removeUser: async () => ({ data: null, error: null }),
      revokeUserSession: async () => ({ data: null, error: null }),
      revokeUserSessions: async () => ({ data: null, error: null }),
      setRole: async () => ({ data: null, error: null }),
      setUserPassword: async () => ({ data: null, error: null }),
      stopImpersonating: async () => ({ data: null, error: null }),
      unbanUser: async () => ({ data: null, error: null }),
      updateUser: async () => ({ data: null, error: null })
    },
    getLastUsedLoginMethod: () => "github",
    getSession: async () => ({ data: storySession, error: null }),
    signIn: {
      email: async () => ({ data: storySession, error: null }),
      social: async () => ({ data: null, error: null })
    }
  },
  "authClient"
) as unknown as AdminAuthClient

function createPluginQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY }
    }
  })
  queryClient.setQueryData(authQueryKeys.session, storySession)
  return queryClient
}

function PluginPreview(props: {
  authClient?: AdminAuthClient
  children: () => JSX.Element
  plugins: AuthPlugin[]
  width?: "max-w-md" | "max-w-4xl"
}) {
  return (
    <AuthProvider
      authClient={props.authClient ?? pluginAuthClient}
      plugins={props.plugins}
      queryClient={createPluginQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      {() => (
        <main class="flex min-h-[680px] w-full items-center justify-center bg-background p-6 text-foreground">
          <div class={`w-full ${props.width ?? "max-w-md"}`}>
            {props.children()}
          </div>
        </main>
      )}
    </AuthProvider>
  )
}

function CaptchaStoryWidget(props: CaptchaRenderProps) {
  const [verified, setVerified] = createSignal(false)

  onMount(() => props.setReset(() => setVerified(false)))
  onCleanup(() => props.setReset(null))

  return (
    <div class="flex flex-col gap-2 rounded-lg border p-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          if (verified()) {
            props.clearToken()
            setVerified(false)
            return
          }

          props.setToken("storybook-captcha-token")
          setVerified(true)
        }}
      >
        {verified() ? "Reset captcha" : "Verify captcha"}
      </Button>
      <p aria-live="polite" class="text-center text-muted-foreground text-xs">
        {verified() ? "Captcha verified" : "Captcha verification required"}
      </p>
    </div>
  )
}

const captchaStoryPlugin = captchaPlugin({ render: CaptchaStoryWidget })

function OneTapPreview() {
  const [context, setContext] = createSignal("Waiting for Google One Tap")
  const authClient = withStoryActions(
    {
      ...(pluginAuthClient as object),
      oneTap: async ({ context: nextContext }: { context?: string }) => {
        setContext(`Google One Tap requested for ${nextContext ?? "sign in"}`)
      }
    },
    "authClient"
  ) as unknown as AdminAuthClient

  return (
    <PluginPreview
      authClient={authClient}
      plugins={[oneTapPlugin({ autoSelect: true })]}
    >
      {() => (
        <div class="flex flex-col gap-4">
          <SignIn />
          <p
            aria-live="polite"
            class="text-center text-muted-foreground text-sm"
          >
            {context()}
          </p>
        </div>
      )}
    </PluginPreview>
  )
}

const meta = {
  id: "zaidan-plugins-complete-coverage",
  title: "Zaidan/Plugins/Authentication helpers",
  parameters: { layout: "fullscreen" }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

type AdminPreviewArgs = {
  allowMultipleRoles?: boolean
}

export const AdminPreview: StoryObj<AdminPreviewArgs> = {
  name: "Admin",
  args: { allowMultipleRoles: true },
  argTypes: {
    allowMultipleRoles: {
      control: "boolean",
      description: "Allow users to have multiple roles"
    }
  },
  render: ({ allowMultipleRoles = true }) => (
    <PluginPreview
      plugins={[
        adminPlugin({
          allowMultipleRoles,
          pageSize: 10,
          showIpAddress: true
        })
      ]}
      width="max-w-4xl"
    >
      {() => <Admin view="users" />}
    </PluginPreview>
  ),
  play: storyRenders
}

export const LastLoginMethodPreview: Story = {
  name: "Last login method",
  render: () => (
    <PluginPreview plugins={[lastLoginMethodPlugin()]}>
      {() => <SignIn />}
    </PluginPreview>
  ),
  play: storyRenders
}

export const OneTapPreviewStory: Story = {
  name: "Google One Tap",
  render: () => <OneTapPreview />,
  play: storyRenders
}

export const CaptchaPreview: Story = {
  name: "Captcha",
  render: () => (
    <PluginPreview plugins={[captchaStoryPlugin]}>
      {() => <SignIn />}
    </PluginPreview>
  ),
  play: storyRenders
}
