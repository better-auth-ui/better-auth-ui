import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { apiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import { useAuth } from "@better-auth-ui/solid"
import { useListApiKeys } from "@better-auth-ui/solid/plugins/api-key"
import { createSignal, For, Show } from "solid-js"
import { ApiKey } from "@/components/auth/api-key/api-key"
import { ApiKeySkeleton } from "@/components/auth/api-key/api-key-skeleton"
import { ApiKeysEmpty } from "@/components/auth/api-key/api-keys-empty"
import { CreateApiKeyDialog } from "@/components/auth/api-key/create-api-key-dialog"
import type { ListedApiKey } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { ItemSeparator } from "@/components/ui/item"
import { cn } from "@/lib/utils"

export type ApiKeysProps = {
  class?: string
  organizationId?: string
  isPending?: boolean
  hideCreate?: boolean
  hideDelete?: boolean
}

export function ApiKeys(props: ApiKeysProps = {}) {
  const auth = useAuth<ApiKeyAuthClient>()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = createSignal(false)
  const listParams = () =>
    props.isPending !== undefined || props.organizationId
      ? {
          query: {
            organizationId: props.organizationId ?? "",
            configId: "organization" as const
          }
        }
      : undefined
  const apiKeys = useListApiKeys(auth.authClient, () => listParams() ?? {})
  const keys = () => apiKeys.data?.apiKeys ?? []
  const pending = () => Boolean(props.isPending || apiKeys.isPending)

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <div class="flex items-end justify-between gap-3">
        <h2 class="truncate text-sm font-semibold">
          {apiKeyLocalization.apiKeys}
        </h2>
        <Show when={!props.hideCreate}>
          <Dialog
            open={isCreateDialogOpen()}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger
              as={Button}
              class="shrink-0"
              disabled={pending()}
              size="sm"
            >
              {apiKeyLocalization.createApiKey}
            </DialogTrigger>
            <CreateApiKeyDialog
              organizationId={props.organizationId}
              onOpenChange={setIsCreateDialogOpen}
            />
          </Dialog>
        </Show>
      </div>

      <Card class="z-card-padding-none">
        <CardContent class="z-card-content-padding-none">
          <Show when={!pending()} fallback={<ApiKeySkeleton />}>
            <Show
              when={keys().length > 0}
              fallback={
                <ApiKeysEmpty
                  hideCreate={props.hideCreate}
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
                    <ApiKey
                      apiKey={apiKey as ListedApiKey}
                      hideDelete={props.hideDelete}
                      organizationId={props.organizationId}
                    />
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

export const ApiKeysSettings = ApiKeys
