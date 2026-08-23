import { authQueryKeys } from "@better-auth-ui/core"
import { deleteUserPlugin } from "@better-auth-ui/core/plugins/delete-user"
import { QueryClient } from "@tanstack/solid-query"
import { createAuthClient } from "better-auth/solid"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AuthProvider } from "@/components/auth/auth-provider"
import { DangerZone } from "@/components/auth/delete-user/danger-zone"
import { storyRenders } from "./story-coverage"

const userId = "user_docs"

const mockAuthClient = createAuthClient({ baseURL: "http://localhost:3000" })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY
    }
  }
})

queryClient.setQueryData(authQueryKeys.session, {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_docs",
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
})

queryClient.setQueryData(authQueryKeys.listAccounts(userId), [
  {
    accountId: "ada@example.com",
    createdAt: new Date("2026-01-12T10:30:00Z"),
    id: "account_docs",
    providerId: "credential",
    scopes: [],
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId
  }
])

function DeleteAccountStory(props: { compact?: boolean }) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      plugins={[deleteUserPlugin()]}
      queryClient={queryClient}
    >
      {() => (
        <main
          class={`mx-auto flex w-full max-w-xl items-center justify-center bg-background text-foreground ${
            props.compact ? "min-h-[240px] p-3" : "min-h-[360px] p-6"
          }`}
        >
          <DangerZone />
        </main>
      )}
    </AuthProvider>
  )
}

const meta = {
  title: "Zaidan/Plugins/Delete User",
  component: DeleteAccountStory,
  args: { compact: false },
  argTypes: { compact: { control: "boolean" } },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof DeleteAccountStory>

export default meta

type Story = StoryObj<typeof meta>

export const DangerZonePreview: Story = { play: storyRenders }
