import { authQueryKeys } from "@better-auth-ui/core"
import { deleteUserPlugin } from "@better-auth-ui/core/plugins/delete-user"
import {
  type PasskeyAuthClient,
  passkeyQueryKeys
} from "@better-auth-ui/core/plugins/passkey"
import type { AuthPlugin } from "@better-auth-ui/solid"
import { QueryClient } from "@tanstack/solid-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import { expect, fn, waitFor, within } from "storybook/test"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AuthProvider } from "@/components/auth/auth-provider"
import { DangerZone } from "@/components/auth/delete-user/danger-zone"
import { PasskeysSettings } from "@/components/auth/passkey/passkeys"
import { ActiveSessionsSettings } from "@/components/auth/settings/security/active-sessions"
import { LinkedAccountsSettings } from "@/components/auth/settings/security/linked-accounts"
import { SignIn } from "@/components/auth/sign-in"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"

const userId = "user_reauthentication_storybook"
const returnTo = "/settings/security?tab=sessions#current"
const sessionData = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_reauthentication_storybook",
    ipAddress: "127.0.0.1",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
    userId
  },
  user: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    email: "ada@example.com",
    emailVerified: true,
    id: userId,
    image: null,
    name: "Ada Lovelace",
    updatedAt: new Date("2026-01-12T10:30:00Z")
  }
}
const accounts = [
  {
    accountId: "credential_account",
    createdAt: new Date("2026-01-12T10:30:00Z"),
    id: "credential_account",
    providerId: "credential",
    scopes: [],
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId
  },
  {
    accountId: "github_account",
    createdAt: new Date("2026-01-12T10:30:00Z"),
    id: "github_account",
    providerId: "github",
    scopes: ["read:user"],
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId
  }
]
const accountInfo = { data: { login: "ada-lovelace" }, error: null }
const passkeys = [
  {
    createdAt: new Date("2026-05-22T02:57:00Z"),
    id: "passkey_storybook",
    name: "MacBook Touch ID"
  }
]

function createReauthenticationError(
  code: "SESSION_EXPIRED" | "SESSION_NOT_FRESH"
) {
  return Object.assign(new Error("Sign in again to continue"), {
    error: { code, message: "Sign in again to continue" },
    status: 403,
    statusText: "Forbidden"
  })
}

const reauthenticationActions = {
  addPasskey: fn(async () => {
    throw createReauthenticationError("SESSION_NOT_FRESH")
  }).mockName("authClient.passkey.addPasskey"),
  deletePasskey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.passkey.deletePasskey"
  ),
  deleteUser: fn(async () => {
    throw createReauthenticationError("SESSION_EXPIRED")
  }).mockName("authClient.deleteUser"),
  listSessions: fn(async () => {
    throw createReauthenticationError("SESSION_NOT_FRESH")
  }).mockName("authClient.listSessions"),
  navigate: fn((_options: { to: string }) => undefined).mockName("navigate"),
  signInPasskey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signIn.passkey"
  ),
  signOut: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signOut"
  ),
  unlinkAccount: fn(async () => {
    throw createReauthenticationError("SESSION_NOT_FRESH")
  }).mockName("authClient.unlinkAccount"),
  updatePasskey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.passkey.updatePasskey"
  )
}

const reauthenticationAuthClient = {
  accountInfo: async () => accountInfo,
  deleteUser: reauthenticationActions.deleteUser,
  getSession: async () => ({ data: sessionData, error: null }),
  linkSocial: async () => ({ data: null, error: null }),
  listAccounts: async () => ({ data: accounts, error: null }),
  listSessions: reauthenticationActions.listSessions,
  passkey: {
    addPasskey: reauthenticationActions.addPasskey,
    deletePasskey: reauthenticationActions.deletePasskey,
    listUserPasskeys: async () => ({ data: passkeys, error: null }),
    updatePasskey: reauthenticationActions.updatePasskey
  },
  signIn: {
    email: async () => ({ data: null, error: null }),
    passkey: reauthenticationActions.signInPasskey,
    social: async () => ({ data: null, error: null })
  },
  signOut: reauthenticationActions.signOut,
  unlinkAccount: reauthenticationActions.unlinkAccount
} as unknown as PasskeyAuthClient

function createReauthenticationQueryClient(options?: {
  activeSessions?: "error"
  accounts?: typeof accounts
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, sessionData)
  queryClient.setQueryData(
    authQueryKeys.listAccounts(userId),
    options?.accounts ?? accounts
  )
  queryClient.setQueryData(
    authQueryKeys.accountInfo(userId, { accountId: "github_account" }),
    accountInfo
  )
  if (options?.activeSessions !== "error") {
    queryClient.setQueryData(authQueryKeys.listSessions(userId), [
      sessionData.session
    ])
  }
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

function ReauthenticationPreview(props: {
  children: JSX.Element
  plugins?: AuthPlugin[]
  queryClient?: QueryClient
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl"
}) {
  const content = () => (
    <AuthProvider
      authClient={reauthenticationAuthClient}
      baseURL="http://localhost:3000"
      navigate={reauthenticationActions.navigate}
      plugins={props.plugins ?? []}
      queryClient={props.queryClient ?? createReauthenticationQueryClient()}
      redirectTo={returnTo}
      socialProviders={["github", "google"]}
    >
      {() => (
        <main class="flex min-h-screen w-full items-center justify-center bg-background p-6 text-foreground">
          <div class={`w-full ${props.width ?? "max-w-2xl"}`}>
            {props.children}
          </div>
        </main>
      )}
    </AuthProvider>
  )

  return <RouterProvider router={createStoryRouter(content)} />
}

function prepareStoryLocation(pathname: string) {
  const previousURL = window.location.href

  for (const action of Object.values(reauthenticationActions)) {
    action.mockClear()
  }

  window.history.replaceState(window.history.state, "", pathname)

  return () => {
    window.history.replaceState(window.history.state, "", previousURL)
  }
}

async function expectSignInNavigation(expectedRedirectTo: string) {
  await waitFor(() => {
    expect(reauthenticationActions.signOut).toHaveBeenCalledTimes(1)
    expect(reauthenticationActions.navigate).toHaveBeenCalledTimes(1)
  })

  const navigation = reauthenticationActions.navigate.mock.calls.at(-1)?.[0]
  if (!navigation) throw new Error("Expected navigation to sign-in")
  const destination = new URL(navigation.to, window.location.origin)

  expect(destination.pathname).toBe("/auth/sign-in")
  expect(destination.searchParams.get("reauthenticate")).toBe("true")
  expect(destination.searchParams.get("redirectTo")).toBe(expectedRedirectTo)
}

const meta = {
  id: "zaidan-components-reauthentication",
  title: "Zaidan/Components/Reauthentication",
  parameters: { layout: "fullscreen" }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const SignInNotice: Story = {
  beforeEach: () =>
    prepareStoryLocation(
      `/auth/sign-in?reauthenticate=true&redirectTo=${encodeURIComponent(returnTo)}`
    ),
  render: () => (
    <ReauthenticationPreview plugins={[passkeyPlugin()]} width="max-w-md">
      <SignIn />
    </ReauthenticationPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("explain why sign-in is required", async () => {
      const callout = await canvas.findByRole("alert")
      const card = callout.closest<HTMLElement>("[data-slot=card]")

      if (!card) throw new Error("Expected reauthentication callout in a card")

      await expect(callout).toHaveTextContent(
        "Please sign in again to verify it’s you before continuing."
      )
      await expect(callout.getBoundingClientRect().left).toBeGreaterThan(
        card.getBoundingClientRect().left
      )
      await expect(callout.getBoundingClientRect().right).toBeLessThan(
        card.getBoundingClientRect().right
      )
    })

    await step("keep every configured sign-in method available", async () => {
      await expect(canvas.getByRole("button", { name: /GitHub/ })).toBeVisible()
      await expect(canvas.getByRole("button", { name: /Google/ })).toBeVisible()
      await expect(
        canvas.getByRole("button", { name: "Continue with Passkey" })
      ).toBeVisible()
      await expect(
        canvas.getByRole("button", { name: "Sign In" })
      ).toBeVisible()
      await expect(reauthenticationActions.signOut).not.toHaveBeenCalled()
    })
  }
}

export const PassiveActiveSessionsFailure: Story = {
  beforeEach: () => prepareStoryLocation(returnTo),
  render: () => (
    <ReauthenticationPreview
      queryClient={createReauthenticationQueryClient({
        activeSessions: "error"
      })}
    >
      <ActiveSessionsSettings />
    </ReauthenticationPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    const signInAgain = await canvas.findByRole("button", {
      name: "Sign in again"
    })

    await step("stay on settings until the user acts", async () => {
      await expect(signInAgain).toBeVisible()
      await expect(reauthenticationActions.listSessions).toHaveBeenCalledTimes(
        1
      )
      await expect(reauthenticationActions.signOut).not.toHaveBeenCalled()
      await expect(reauthenticationActions.navigate).not.toHaveBeenCalled()
    })

    await step("start normal sign-in from the explicit action", async () => {
      await userEvent.click(signInAgain)
      await expectSignInNavigation(returnTo)
    })
  }
}

export const UnlinkAccountFailure: Story = {
  beforeEach: () => prepareStoryLocation("/settings/security#accounts"),
  render: () => (
    <ReauthenticationPreview>
      <LinkedAccountsSettings />
    </ReauthenticationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step(
      "request reauthentication after unlink is rejected",
      async () => {
        await userEvent.click(
          await canvas.findByRole("button", { name: "Unlink GitHub" })
        )

        const body = within(canvasElement.ownerDocument.body)
        await expect(
          await body.findByRole("button", { name: "Sign in again" })
        ).toBeVisible()
        await expect(
          reauthenticationActions.unlinkAccount
        ).toHaveBeenCalledTimes(1)
      }
    )

    await step("do not replay unlink while leaving for sign-in", async () => {
      const body = within(canvasElement.ownerDocument.body)
      await userEvent.click(body.getByRole("button", { name: "Sign in again" }))
      await expectSignInNavigation("/settings/security#accounts")
      await expect(reauthenticationActions.unlinkAccount).toHaveBeenCalledTimes(
        1
      )
    })
  }
}

export const AddPasskeyFailure: Story = {
  beforeEach: () => prepareStoryLocation("/settings/security#passkeys"),
  render: () => (
    <ReauthenticationPreview plugins={[passkeyPlugin()]}>
      <PasskeysSettings />
    </ReauthenticationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step(
      "request reauthentication after registration is rejected",
      async () => {
        await userEvent.click(
          await canvas.findByRole("button", { name: "Add passkey" })
        )
        const dialog = await body.findByRole("dialog")
        await userEvent.click(
          within(dialog).getByRole("button", { name: "Add passkey" })
        )
        await expect(
          await body.findByRole("button", { name: "Sign in again" })
        ).toBeVisible()
        await expect(reauthenticationActions.addPasskey).toHaveBeenCalledTimes(
          1
        )
      }
    )

    await step("do not replay passkey registration", async () => {
      await userEvent.click(body.getByRole("button", { name: "Sign in again" }))
      await expectSignInNavigation("/settings/security#passkeys")
      await expect(reauthenticationActions.addPasskey).toHaveBeenCalledTimes(1)
    })
  }
}

export const DeleteAccountExpiredSession: Story = {
  beforeEach: () => prepareStoryLocation("/settings/account#danger-zone"),
  render: () => (
    <ReauthenticationPreview
      plugins={[deleteUserPlugin()]}
      queryClient={createReauthenticationQueryClient({
        accounts: accounts.filter(
          (account) => account.providerId !== "credential"
        )
      })}
    >
      <DangerZone />
    </ReauthenticationPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body)

    await step("recognize delete-user SESSION_EXPIRED", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: "Delete account" })
      )
      const dialog = await body.findByRole("alertdialog")
      await userEvent.click(
        within(dialog).getByRole("button", { name: "Delete account" })
      )
      await expect(
        await body.findByRole("button", { name: "Sign in again" })
      ).toBeVisible()
      await expect(reauthenticationActions.deleteUser).toHaveBeenCalledTimes(1)
    })

    await step("leave deletion for the user to confirm again", async () => {
      await userEvent.click(body.getByRole("button", { name: "Sign in again" }))
      await expectSignInNavigation("/settings/account#danger-zone")
      await expect(reauthenticationActions.deleteUser).toHaveBeenCalledTimes(1)
    })
  }
}
