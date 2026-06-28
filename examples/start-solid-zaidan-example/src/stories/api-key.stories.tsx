import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { ApiKey } from "@/components/auth/api-key/api-key"
import { ApiKeysEmpty } from "@/components/auth/api-key/api-keys-empty"
import { AuthProvider } from "@/components/auth/auth-provider"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { Card, CardContent } from "@/components/ui/card"
import { ItemSeparator } from "@/components/ui/item"

const mockAuthClient = {
  apiKey: {
    delete: async () => ({ data: null, error: null })
  }
} as unknown as ApiKeyAuthClient

const apiKeys = [
  {
    id: "key_live_docs",
    name: "Production API",
    start: "bau_live_",
    createdAt: new Date("2026-01-12T10:30:00Z")
  },
  {
    id: "key_test_docs",
    name: "Test integration",
    start: "bau_test_",
    createdAt: new Date("2026-02-04T16:45:00Z")
  }
] as unknown as ListedApiKey[]

function ApiKeyStory() {
  return (
    <AuthProvider authClient={mockAuthClient}>
      {() => (
        <main class="mx-auto flex min-h-[420px] w-full max-w-xl items-center justify-center bg-background p-6 text-foreground">
          <div class="flex w-full flex-col gap-6">
            <section class="flex flex-col gap-3">
              <div class="flex items-end justify-between gap-3">
                <div>
                  <h2 class="font-semibold text-sm">API Keys</h2>
                  <p class="text-muted-foreground text-xs">
                    User-owned keys rendered with copied Zaidan components.
                  </p>
                </div>
              </div>

              <Card class="z-card-padding-none">
                <CardContent class="z-card-content-padding-none">
                  {apiKeys.map((apiKey, index) => (
                    <>
                      {index > 0 ? <ItemSeparator /> : null}
                      <ApiKey apiKey={apiKey} />
                    </>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section class="flex flex-col gap-3">
              <h2 class="font-semibold text-sm">Empty state</h2>
              <Card class="z-card-padding-none">
                <CardContent class="z-card-content-padding-none">
                  <ApiKeysEmpty onCreatePress={() => undefined} />
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      )}
    </AuthProvider>
  )
}

const meta = {
  title: "Zaidan/Plugins/API Key",
  component: ApiKeyStory,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof ApiKeyStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
