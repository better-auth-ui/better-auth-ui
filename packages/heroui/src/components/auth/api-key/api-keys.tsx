import { getLookaheadPage } from "@better-auth-ui/core"
import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Label,
  ListBox,
  Select
} from "@heroui/react"
import {
  createTableHook,
  functionalUpdate,
  type PaginationState,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  type Updater
} from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import { ApiKey } from "./api-key"
import { ApiKeySkeleton } from "./api-key-skeleton"
import { ApiKeysEmpty } from "./api-keys-empty"
import { CreateApiKeyDialog } from "./create-api-key-dialog"

const { createAppColumnHelper, useAppTable: useApiKeyTable } = createTableHook({
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
  className?: string
  variant?: CardProps["variant"]
  /** Scope the list and create payload to an organization. */
  organizationId?: string
  /** Force the loading skeleton and disable the list query. */
  isPending?: boolean
  /** Hide the "Create API key" button (header + empty state). */
  hideCreate?: boolean
  /** Hide the per-row delete button on listed keys. */
  hideDelete?: boolean
  /** Hide the per-row edit button on listed keys. */
  hideUpdate?: boolean
}

export function ApiKeys({
  className,
  variant,
  organizationId,
  isPending: isPendingProp,
  hideCreate,
  hideDelete,
  hideUpdate
}: ApiKeysProps) {
  const { authClient } = useAuth()
  const { localization: apiKeyLocalization, pageSize } =
    useAuthPlugin(apiKeyPlugin)
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize
  })
  const [sorting, setSortingState] = useState<SortingState>([
    { id: "createdAt", desc: true }
  ])
  const primarySort = sorting[0]
  const sortBy = primarySort?.id === "name" ? "name" : "createdAt"
  const sortDirection = primarySort?.desc ? "desc" : "asc"
  const sort = `${sortBy}:${sortDirection}`

  const {
    data: listData,
    isPending: isListPending,
    isSuccess: isListSuccess
  } = useListApiKeys(authClient as ApiKeyAuthClient, {
    enabled: !isPendingProp,
    query: {
      limit: pagination.pageSize + 1,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy,
      sortDirection,
      ...(organizationId ? { organizationId, configId: "organization" } : {})
    }
  })

  const isPending = isPendingProp || isListPending
  const page = useMemo(
    () =>
      getLookaheadPage(
        listData?.apiKeys ?? EMPTY_API_KEYS,
        pagination.pageSize
      ),
    [listData?.apiKeys, pagination.pageSize]
  )
  const setPagination = (updater: Updater<PaginationState>) =>
    setPaginationState((current) => functionalUpdate(updater, current))
  const setSorting = (updater: Updater<SortingState>) => {
    setSortingState((current) => functionalUpdate(updater, current))
    setPaginationState((current) => ({ ...current, pageIndex: 0 }))
  }

  useEffect(() => {
    if (
      isListSuccess &&
      !isPendingProp &&
      pagination.pageIndex > 0 &&
      page.rows.length === 0
    ) {
      setPaginationState((current) => ({
        ...current,
        pageIndex: Math.max(0, current.pageIndex - 1)
      }))
    }
  }, [isListSuccess, isPendingProp, page.rows.length, pagination.pageIndex])

  const table = useApiKeyTable({
    columns: apiKeyColumns,
    data: page.rows,
    getRowId: (apiKey) => apiKey.id,
    manualPagination: true,
    manualSorting: true,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting
  })

  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold truncate">
          {apiKeyLocalization.apiKeys}
        </h2>

        {!hideCreate && (
          <Button
            className="shrink-0"
            size="sm"
            isDisabled={isPending}
            onPress={() => setCreateOpen(true)}
          >
            {apiKeyLocalization.createApiKey}
          </Button>
        )}
      </div>
      <Select
        aria-label={apiKeyLocalization.sortBy}
        value={sort}
        onChange={(value) => {
          const [id, direction] = String(value).split(":")
          table.setSorting([{ id, desc: direction === "desc" }])
        }}
      >
        <Label>{apiKeyLocalization.sortBy}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="createdAt:desc">
              {apiKeyLocalization.newest}
            </ListBox.Item>
            <ListBox.Item id="createdAt:asc">
              {apiKeyLocalization.oldest}
            </ListBox.Item>
            <ListBox.Item id="name:asc">
              {apiKeyLocalization.nameAscending}
            </ListBox.Item>
            <ListBox.Item id="name:desc">
              {apiKeyLocalization.nameDescending}
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      <Card variant={variant}>
        <Card.Content>
          {isPending ? (
            <ApiKeySkeleton />
          ) : page.rows.length === 0 ? (
            <ApiKeysEmpty
              onCreatePress={() => setCreateOpen(true)}
              hideCreate={hideCreate}
            />
          ) : (
            table.getRowModel().rows.map((row, index) => (
              <div key={row.id}>
                {index > 0 && (
                  <div className="border-b border-dashed -mx-4 my-4" />
                )}

                <ApiKey
                  apiKey={row.original}
                  hideDelete={hideDelete}
                  hideUpdate={hideUpdate}
                  organizationId={organizationId}
                />
              </div>
            ))
          )}
        </Card.Content>
      </Card>
      {(pagination.pageIndex > 0 || page.hasNextPage) && (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            isDisabled={!table.getCanPreviousPage()}
            onPress={() => table.previousPage()}
          >
            {apiKeyLocalization.previousPage}
          </Button>
          <Button
            size="sm"
            variant="outline"
            isDisabled={!page.hasNextPage}
            onPress={() => table.nextPage()}
          >
            {apiKeyLocalization.nextPage}
          </Button>
        </div>
      )}

      {!hideCreate && (
        <CreateApiKeyDialog
          isOpen={createOpen}
          onOpenChange={setCreateOpen}
          organizationId={organizationId}
        />
      )}
    </div>
  )
}
