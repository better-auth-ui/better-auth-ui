import { authQueryKeys } from "@better-auth-ui/core"
import { passkeyQueryKeys } from "@better-auth-ui/core/plugins/passkey"
import {
  ActiveSessions,
  AuthProvider,
  LinkedAccounts,
  SignIn
} from "@better-auth-ui/heroui"
import {
  DangerZone,
  deleteUserPlugin
} from "@better-auth-ui/heroui/plugins/delete-user"
import { Passkeys, passkeyPlugin } from "@better-auth-ui/heroui/plugins/passkey"
import type { AuthPlugin } from "@better-auth-ui/react"
import { Toast } from "@heroui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { expect, fn, waitFor, within } from "storybook/test"

import {
  createStoryQueryClient,
  StoryShell,
  storyAccounts,
  storyAuthClient,
  storyUserId
} from "../support/story-fixtures"

const returnTo = "/settings/security?tab=sessions#current"
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
  ...(storyAuthClient as object),
  deleteUser: reauthenticationActions.deleteUser,
  listSessions: reauthenticationActions.listSessions,
  passkey: {
    addPasskey: reauthenticationActions.addPasskey,
    deletePasskey: reauthenticationActions.deletePasskey,
    listUserPasskeys: async () => ({ data: passkeys, error: null }),
    updatePasskey: reauthenticationActions.updatePasskey
  },
  signIn: {
    ...(storyAuthClient as { signIn: object }).signIn,
    passkey: reauthenticationActions.signInPasskey
  },
  signOut: reauthenticationActions.signOut,
  unlinkAccount: reauthenticationActions.unlinkAccount
} as never

function createReauthenticationQueryClient(options?: {
  activeSessions?: "error"
  accounts?: typeof storyAccounts
}) {
  const queryClient = createStoryQueryClient()

  if (options?.activeSessions === "error") {
    queryClient.removeQueries({
      exact: true,
      queryKey: authQueryKeys.listSessions(storyUserId)
    })
  }

  if (options?.accounts) {
    queryClient.setQueryData(
      authQueryKeys.listAccounts(storyUserId),
      options.accounts
    )
  }

  queryClient.setQueryData(passkeyQueryKeys.list(storyUserId), passkeys)

  return queryClient
}

function ReauthenticationPreview({
  children,
  plugins = [],
  queryClient = createReauthenticationQueryClient(),
  width = "max-w-2xl"
}: {
  children: ReactNode
  plugins?: AuthPlugin[]
  queryClient?: ReturnType<typeof createStoryQueryClient>
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl"
}) {
  return (
    <AuthProvider
      authClient={reauthenticationAuthClient}
      baseURL="http://localhost:3000"
      navigate={reauthenticationActions.navigate}
      plugins={plugins}
      queryClient={queryClient}
      redirectTo={returnTo}
      socialProviders={["github", "google"]}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toast.Provider />
    </AuthProvider>
  )
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
  id: "heroui-components-reauthentication",
  title: "HeroUI/Components/Reauthentication",
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
      await expect(
        await canvas.findByText(
          "Please sign in again to verify it’s you before continuing."
        )
      ).toBeVisible()
      await expect(canvas.getByText("Sign in again")).toBeVisible()
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
      <ActiveSessions />
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
      <LinkedAccounts />
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
        const signInAgain = await body.findByRole("button", {
          name: "Sign in again"
        })
        await waitFor(() => expect(signInAgain).toBeVisible())
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
      <Passkeys />
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
        const dialog = await body.findByRole("alertdialog")
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
        accounts: storyAccounts.filter(
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
