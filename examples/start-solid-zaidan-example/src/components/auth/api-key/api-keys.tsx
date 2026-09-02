import { getLookaheadPage } from "@better-auth-ui/core"
import {
  type ApiKeyAuthClient,
  apiKeyLocalization,
  type ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useListApiKeys } from "@better-auth-ui/solid/plugins/api-key"
import {
  createTableHook,
  functionalUpdate,
  type PaginationState,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  type Updater
} from "@tanstack/solid-table"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import { ApiKey } from "@/components/auth/api-key/api-key"
import { ApiKeySkeleton } from "@/components/auth/api-key/api-key-skeleton"
import { ApiKeysEmpty } from "@/components/auth/api-key/api-keys-empty"
import { CreateApiKeyDialog } from "@/components/auth/api-key/create-api-key-dialog"
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

const { createAppColumnHelper, createAppTable: createApiKeyTable } =
  createTableHook({
    enableMultiSort: false,
    enableSortingRemoval: false,
    sortDescFirst: false,
    features: tableFeatures({ rowPaginationFeature, rowSortingFeature })
  })

const apiKeyColumnHelper = createAppColumnHelper<ListedApiKey>()
const apiKeyColumns = apiKeyColumnHelper.columns([
  apiKeyColumnHelper.accessor("createdAt", { id: "createdAt" }),
  apiKeyColumnHelper.accessor("name", { id: "name" })
])
const EMPTY_API_KEYS: ListedApiKey[] = []

export type ApiKeysProps = {
  class?: string
  organizationId?: string
  isPending?: boolean
  hideCreate?: boolean
  hideDelete?: boolean
  hideUpdate?: boolean
}

export function ApiKeys(props: ApiKeysProps = {}) {
  const auth = useAuth<ApiKeyAuthClient>()
  const config = useAuthPlugin(apiKeyPlugin)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = createSignal(false)
  const pageSize = config.pageSize
  const [pagination, setPaginationState] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize
  })
  const [sorting, setSortingState] = createSignal<SortingState>([
    { id: "createdAt", desc: true }
  ])
  const sort = () => {
    const primarySort = sorting()[0]
    const id = primarySort?.id === "name" ? "name" : "createdAt"
    const direction = primarySort?.desc ? "desc" : "asc"
    return {
      id: `${id}:${direction}`,
      label:
        id === "name"
          ? direction === "desc"
            ? apiKeyLocalization.nameDescending
            : apiKeyLocalization.nameAscending
          : direction === "desc"
            ? apiKeyLocalization.newest
            : apiKeyLocalization.oldest
    }
  }
  const listParams = () => ({
    enabled: !props.isPending,
    query: {
      ...(props.organizationId
        ? {
            organizationId: props.organizationId,
            configId: "organization" as const
          }
        : {}),
      limit: pagination().pageSize + 1,
      offset: pagination().pageIndex * pagination().pageSize,
      sortBy: sort().id.split(":")[0],
      sortDirection: sort().id.split(":")[1] as "asc" | "desc"
    }
  })
  const apiKeys = useListApiKeys(auth.authClient, () => listParams() ?? {})
  const page = createMemo(() =>
    getLookaheadPage(
      apiKeys.data?.apiKeys ?? EMPTY_API_KEYS,
      pagination().pageSize
    )
  )
  const pending = () => Boolean(props.isPending || apiKeys.isPending)
  const setPagination = (updater: Updater<PaginationState>) =>
    setPaginationState((current) => functionalUpdate(updater, current))
  const setSorting = (updater: Updater<SortingState>) => {
    setSortingState((current) => functionalUpdate(updater, current))
    setPaginationState((current) => ({ ...current, pageIndex: 0 }))
  }

  createEffect(() => {
    if (
      apiKeys.isSuccess &&
      !props.isPending &&
      pagination().pageIndex > 0 &&
      page().rows.length === 0
    ) {
      setPaginationState((current) => ({
        ...current,
        pageIndex: Math.max(0, current.pageIndex - 1)
      }))
    }
  })

  const table = createApiKeyTable({
    columns: apiKeyColumns,
    get data() {
      return page().rows
    },
    get state() {
      return { pagination: pagination(), sorting: sorting() }
    },
    getRowId: (apiKey) => apiKey.id,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting
  })

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
            const [id, direction] = value.id.split(":")
            table.setSorting([{ id, desc: direction === "desc" }])
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
              when={page().rows.length > 0}
              fallback={
                <ApiKeysEmpty
                  hideCreate={props.hideCreate}
                  onCreatePress={() => setIsCreateDialogOpen(true)}
                />
              }
            >
              <ItemGroup class="gap-0">
                <For each={table.getRowModel().rows}>
                  {(row, index) => (
                    <>
                      <Show when={index() > 0}>
                        <ItemSeparator />
                      </Show>
                      <ApiKey
                        apiKey={row.original}
                        hideDelete={props.hideDelete}
                        hideUpdate={props.hideUpdate}
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
      <Show when={pagination().pageIndex > 0 || page().hasNextPage}>
        <div class="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            {apiKeyLocalization.previousPage}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!page().hasNextPage}
            onClick={() => table.nextPage()}
          >
            {apiKeyLocalization.nextPage}
          </Button>
        </div>
      </Show>
    </div>
  )
}

export const ApiKeysSettings = ApiKeys
