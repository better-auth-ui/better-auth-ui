import { apiKeyLocalization } from "@better-auth-ui/core/plugins"
import {
  type ApiKeyAuthClient,
  listApiKeysOptions,
  useAuth
} from "@better-auth-ui/solid"
import { createQuery } from "@tanstack/solid-query"
import { createSignal, For, Show } from "solid-js"
import { ApiKey } from "@/components/auth/api-key/api-key"
import { ApiKeySkeleton } from "@/components/auth/api-key/api-key-skeleton"
import { ApiKeysEmpty } from "@/components/auth/api-key/api-keys-empty"
import { CreateApiKeyDialog } from "@/components/auth/api-key/create-api-key-dialog"
import { shouldLoadDeviceSessions } from "@/components/auth/settings/shared/helpers"
import type {
  ListedApiKey,
  SettingsSession
} from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { ItemSeparator } from "@/components/ui/item"

export function ApiKeysSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const [isCreateDialogOpen, setIsCreateDialogOpen] = createSignal(false)
  const apiKeys = createQuery(() => ({
    ...listApiKeysOptions(auth.authClient as ApiKeyAuthClient, userId()),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const keys = () => apiKeys.data?.apiKeys ?? []

  return (
    <div class="flex flex-col gap-3">
      <div class="flex items-end justify-between gap-3">
        <h2 class="truncate text-sm font-semibold">
          {apiKeyLocalization.apiKeys}
        </h2>
        <Dialog
          open={isCreateDialogOpen()}
          onOpenChange={setIsCreateDialogOpen}
        >
          <DialogTrigger
            as={Button}
            class="shrink-0"
            disabled={apiKeys.isPending}
            size="sm"
          >
            {apiKeyLocalization.createApiKey}
          </DialogTrigger>
          <CreateApiKeyDialog onOpenChange={setIsCreateDialogOpen} />
        </Dialog>
      </div>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show when={!apiKeys.isPending} fallback={<ApiKeySkeleton />}>
            <Show
              when={keys().length > 0}
              fallback={
                <ApiKeysEmpty
                  onCreatePress={() => setIsCreateDialogOpen(true)}
                />
              }
            >
              <For each={keys()}>
                {(apiKey, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <ApiKey apiKey={apiKey as ListedApiKey} />
                  </>
                )}
              </For>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
