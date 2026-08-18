import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { apiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
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
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
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
  const config = useAuthPlugin(apiKeyPlugin)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = createSignal(false)
  const [page, setPage] = createSignal(0)
  const [sort, setSort] = createSignal({
    id: "createdAt:desc",
    label: apiKeyLocalization.newest
  })
  const pageSize = config.pageSize
  const listParams = () => ({
    query: {
      ...(props.organizationId
        ? {
            organizationId: props.organizationId,
            configId: "organization" as const
          }
        : {}),
      limit: pageSize,
      offset: page() * pageSize,
      sortBy: sort().id.split(":")[0],
      sortDirection: sort().id.split(":")[1] as "asc" | "desc"
    }
  })
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
      <Select
        options={[
          { id: "createdAt:desc", label: apiKeyLocalization.newest },
          { id: "createdAt:asc", label: apiKeyLocalization.oldest },
          { id: "name:asc", label: apiKeyLocalization.nameAscending },
          { id: "name:desc", label: apiKeyLocalization.nameDescending }
        ]}
        optionTextValue="label"
        optionValue="id"
        value={sort()}
        onChange={(value) => {
          if (value) {
            setSort(value)
            setPage(0)
          }
        }}
        itemComponent={(itemProps) => (
          <SelectItem item={itemProps.item}>
            {itemProps.item.rawValue.label}
          </SelectItem>
        )}
      >
        <SelectTrigger>
          <SelectValue>
            {(state) =>
              (state.selectedOption() as { label: string } | undefined)?.label
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>

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
              <ItemGroup class="gap-0">
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
              </ItemGroup>
            </Show>
          </Show>
        </CardContent>
      </Card>
      <Show when={page() > 0 || keys().length === pageSize}>
        <div class="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page() === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            {apiKeyLocalization.previousPage}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={keys().length < pageSize}
            onClick={() => setPage((value) => value + 1)}
          >
            {apiKeyLocalization.nextPage}
          </Button>
        </div>
      </Show>
    </div>
  )
}

export const ApiKeysSettings = ApiKeys
