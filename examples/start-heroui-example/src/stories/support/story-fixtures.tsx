import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { fn } from "storybook/test"

export const storyUserId = "user_storybook"

export const storySession = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_storybook",
    ipAddress: "127.0.0.1",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
    userId: storyUserId
  },
  user: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    email: "ada@example.com",
    emailVerified: true,
    id: storyUserId,
    image: null,
    name: "Ada Lovelace",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    username: "ada"
  }
}

export const storyAccounts = [
  {
    accountId: "credential_account",
    createdAt: new Date("2026-01-12T10:30:00Z"),
    id: "credential_account",
    providerId: "credential",
    scopes: [],
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId: storyUserId
  },
  {
    accountId: "github_account",
    createdAt: new Date("2026-01-12T10:30:00Z"),
    id: "github_account",
    providerId: "github",
    scopes: ["read:user"],
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId: storyUserId
  }
]

export const storyGitHubAccountInfo = {
  data: { login: "ada-lovelace" },
  error: null
}

export const storySessions = [
  storySession.session,
  {
    ...storySession.session,
    createdAt: new Date("2026-01-11T08:15:00Z"),
    id: "session_storybook_phone",
    ipAddress: "127.0.0.2",
    updatedAt: new Date("2026-01-11T08:15:00Z"),
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"
  }
]

export const storyActions = {
  accountInfo: fn(async () => storyGitHubAccountInfo).mockName(
    "authClient.accountInfo"
  ),
  changeEmail: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.changeEmail"
  ),
  changePassword: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.changePassword"
  ),
  getSession: fn(async () => ({ data: storySession, error: null })).mockName(
    "authClient.getSession"
  ),
  isUsernameAvailable: fn(async ({ username }: { username: string }) => ({
    data: { available: username.toLowerCase() !== "taken" },
    error: null
  })).mockName("authClient.isUsernameAvailable"),
  linkSocial: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.linkSocial"
  ),
  listAccounts: fn(async () => ({ data: storyAccounts, error: null })).mockName(
    "authClient.listAccounts"
  ),
  listSessions: fn(async () => ({ data: storySessions, error: null })).mockName(
    "authClient.listSessions"
  ),
  navigate: fn().mockName("navigate"),
  requestPasswordReset: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.requestPasswordReset"
  ),
  resetPassword: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.resetPassword"
  ),
  revokeSession: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.revokeSession"
  ),
  sendVerificationEmail: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.sendVerificationEmail"
  ),
  signInEmail: fn(async () => ({ data: storySession, error: null })).mockName(
    "authClient.signIn.email"
  ),
  signInSocial: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signIn.social"
  ),
  signInUsername: fn(async () => ({
    data: storySession,
    error: null
  })).mockName("authClient.signIn.username"),
  signOut: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signOut"
  ),
  signUpEmail: fn(async () => ({ data: storySession, error: null })).mockName(
    "authClient.signUp.email"
  ),
  unlinkAccount: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.unlinkAccount"
  ),
  updateUser: fn(async () => ({
    data: storySession.user,
    error: null
  })).mockName("authClient.updateUser")
}

export const storyAuthClient = {
  accountInfo: storyActions.accountInfo,
  changeEmail: storyActions.changeEmail,
  changePassword: storyActions.changePassword,
  getSession: storyActions.getSession,
  isUsernameAvailable: storyActions.isUsernameAvailable,
  linkSocial: storyActions.linkSocial,
  listAccounts: storyActions.listAccounts,
  listSessions: storyActions.listSessions,
  requestPasswordReset: storyActions.requestPasswordReset,
  resetPassword: storyActions.resetPassword,
  revokeSession: storyActions.revokeSession,
  sendVerificationEmail: storyActions.sendVerificationEmail,
  signIn: {
    email: storyActions.signInEmail,
    social: storyActions.signInSocial,
    username: storyActions.signInUsername
  },
  signOut: storyActions.signOut,
  signUp: { email: storyActions.signUpEmail },
  unlinkAccount: storyActions.unlinkAccount,
  updateUser: storyActions.updateUser
} as never

export function createStoryQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, storySession)
  queryClient.setQueryData(
    authQueryKeys.listAccounts(storyUserId),
    storyAccounts
  )
  queryClient.setQueryData(
    authQueryKeys.accountInfo(storyUserId, {
      accountId: "github_account"
    }),
    storyGitHubAccountInfo
  )
  queryClient.setQueryData(
    authQueryKeys.listSessions(storyUserId),
    storySessions
  )

  return queryClient
}

export function StoryShell({
  children,
  width = "max-w-2xl"
}: {
  children: ReactNode
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl" | "max-w-4xl"
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-6 text-foreground">
      <div className={`w-full ${width}`}>{children}</div>
    </main>
  )
}
