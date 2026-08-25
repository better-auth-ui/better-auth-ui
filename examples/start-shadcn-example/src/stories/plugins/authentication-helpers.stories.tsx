import type { AuthPlugin } from "@better-auth-ui/react"
import {
  type CaptchaRenderProps,
  captchaPlugin
} from "@better-auth-ui/react/plugins/captcha"
import { oneTapPlugin } from "@better-auth-ui/react/plugins/one-tap"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import { expect, fn } from "storybook/test"

import { Admin } from "@/components/auth/admin/admin"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SignIn } from "@/components/auth/sign-in"
import { Button } from "@/components/ui/button"
import { adminPlugin } from "@/lib/auth/admin-plugin"
import { lastLoginMethodPlugin } from "@/lib/auth/last-login-method-plugin"

import {
  createStoryQueryClient,
  StoryLink,
  StoryShell,
  storyActions,
  storyAuthClient,
  storyUserId
} from "../support/story-fixtures"

const adminUsers = [
  {
    banned: false,
    createdAt: new Date("2026-01-12T10:30:00Z"),
    email: "ada@example.com",
    emailVerified: true,
    id: storyUserId,
    image: null,
    name: "Ada Lovelace",
    role: "admin",
    updatedAt: new Date("2026-08-23T08:15:00Z")
  },
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

const adminActions = {
  createUser: fn(async () => ({ data: { user: adminUsers[1] }, error: null })),
  listUsers: fn(async () => ({
    data: { users: adminUsers, total: adminUsers.length },
    error: null
  })).mockName("authClient.admin.listUsers"),
  mutateUser: fn(async () => ({ data: null, error: null })),
  permission: fn(async () => ({
    data: { success: true },
    error: null
  })).mockName("authClient.admin.hasPermission")
}

const pluginAuthClient = {
  ...(storyAuthClient as object),
  admin: {
    banUser: adminActions.mutateUser,
    createUser: adminActions.createUser,
    getUser: async ({ query }: { query: { id: string } }) => ({
      data: adminUsers.find((user) => user.id === query.id) ?? adminUsers[0],
      error: null
    }),
    hasPermission: adminActions.permission,
    impersonateUser: adminActions.mutateUser,
    listUserSessions: async () => ({ data: { sessions: [] }, error: null }),
    listUsers: adminActions.listUsers,
    removeUser: adminActions.mutateUser,
    revokeUserSession: adminActions.mutateUser,
    revokeUserSessions: adminActions.mutateUser,
    setRole: adminActions.mutateUser,
    setUserPassword: adminActions.mutateUser,
    stopImpersonating: adminActions.mutateUser,
    unbanUser: adminActions.mutateUser,
    updateUser: adminActions.mutateUser
  },
  getLastUsedLoginMethod: () => "github"
} as never

function PluginPreview({
  authClient = pluginAuthClient,
  children,
  plugins,
  width = "max-w-md"
}: {
  authClient?: typeof pluginAuthClient
  children: ReactNode
  plugins: AuthPlugin[]
  width?: "max-w-md" | "max-w-4xl"
}) {
  return (
    <AuthProvider
      authClient={authClient}
      baseURL="http://localhost:3000"
      Link={StoryLink}
      navigate={storyActions.navigate}
      plugins={plugins}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <StoryShell width={width}>{children}</StoryShell>
    </AuthProvider>
  )
}

function CaptchaStoryWidget({
  clearToken,
  setReset,
  setToken
}: CaptchaRenderProps) {
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    setReset(() => setVerified(false))
    return () => setReset(null)
  }, [setReset])

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          if (verified) {
            clearToken()
            setVerified(false)
            return
          }

          setToken("storybook-captcha-token")
          setVerified(true)
        }}
      >
        {verified ? "Reset captcha" : "Verify captcha"}
      </Button>
      <p
        aria-live="polite"
        className="text-center text-muted-foreground text-xs"
      >
        {verified ? "Captcha verified" : "Captcha verification required"}
      </p>
    </div>
  )
}

const captchaStoryPlugin = captchaPlugin({ render: CaptchaStoryWidget })

function OneTapPreview() {
  const [context, setContext] = useState("Waiting for Google One Tap")
  const authClient = useMemo(
    () =>
      ({
        ...(pluginAuthClient as object),
        oneTap: fn(async ({ context: nextContext }: { context?: string }) => {
          setContext(`Google One Tap requested for ${nextContext ?? "sign in"}`)
        }).mockName("authClient.oneTap")
      }) as never,
    []
  )

  return (
    <PluginPreview
      authClient={authClient}
      plugins={[oneTapPlugin({ autoSelect: true })]}
    >
      <div className="flex flex-col gap-4">
        <SignIn />
        <p
          aria-live="polite"
          className="text-center text-muted-foreground text-sm"
        >
          {context}
        </p>
      </div>
    </PluginPreview>
  )
}

const meta = {
  id: "shadcn-ui-plugins-complete-coverage",
  title: "shadcn/Plugins/Authentication helpers",
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
      <Admin view="users" />
    </PluginPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("load the admin user directory", async () => {
      await expect(await canvas.findByText("Grace Hopper")).toBeVisible()
      await expect(canvas.getByText("Alan Turing")).toBeVisible()
      await expect(adminActions.permission).toHaveBeenCalled()
      await expect(adminActions.listUsers).toHaveBeenCalled()
    })
  }
}

export const LastLoginMethodPreview: Story = {
  name: "Last login method",
  render: () => (
    <PluginPreview plugins={[lastLoginMethodPlugin()]}>
      <SignIn />
    </PluginPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("mark the last provider used", async () => {
      await expect(await canvas.findByText("Last")).toBeVisible()
      await expect(canvas.getByRole("button", { name: /GitHub/ })).toBeVisible()
    })
  }
}

export const OneTapPreviewStory: Story = {
  name: "Google One Tap",
  render: () => <OneTapPreview />,
  play: async ({ canvas, step }) => {
    await step("request the headless sign-in prompt", async () => {
      await expect(
        await canvas.findByText("Google One Tap requested for signin")
      ).toBeVisible()
    })
  }
}

export const CaptchaPreview: Story = {
  name: "Captcha",
  render: () => (
    <PluginPreview plugins={[captchaStoryPlugin]}>
      <SignIn />
    </PluginPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("solve the captcha", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Verify captcha" })
      )
      await expect(canvas.getByText("Captcha verified")).toBeVisible()
    })
  }
}
