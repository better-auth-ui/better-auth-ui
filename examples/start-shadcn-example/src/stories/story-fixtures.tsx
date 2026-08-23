import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/react-query"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

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

export const storyAuthClient = {
  changeEmail: async () => ({ data: null, error: null }),
  changePassword: async () => ({ data: null, error: null }),
  getSession: async () => ({ data: storySession, error: null }),
  isUsernameAvailable: async ({ username }: { username: string }) => ({
    data: { available: username.toLowerCase() !== "taken" },
    error: null
  }),
  linkSocial: async () => ({ data: null, error: null }),
  listAccounts: async () => ({ data: storyAccounts, error: null }),
  listSessions: async () => ({ data: storySessions, error: null }),
  requestPasswordReset: async () => ({ data: null, error: null }),
  resetPassword: async () => ({ data: null, error: null }),
  revokeSession: async () => ({ data: null, error: null }),
  sendVerificationEmail: async () => ({ data: null, error: null }),
  signIn: {
    email: async () => ({ data: storySession, error: null }),
    social: async () => ({ data: null, error: null }),
    username: async () => ({ data: storySession, error: null })
  },
  signOut: async () => ({ data: null, error: null }),
  signUp: {
    email: async () => ({ data: storySession, error: null })
  },
  unlinkAccount: async () => ({ data: null, error: null }),
  updateUser: async () => ({ data: storySession.user, error: null })
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
    authQueryKeys.listSessions(storyUserId),
    storySessions
  )

  return queryClient
}

type StoryLinkProps = ComponentPropsWithoutRef<"a"> & { to?: string }

export function StoryLink({ href, to, ...props }: StoryLinkProps) {
  return <a href={href ?? to} {...props} />
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
