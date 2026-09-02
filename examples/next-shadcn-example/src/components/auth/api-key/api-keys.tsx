"use client"

import { getLookaheadPage } from "@better-auth-ui/core"
import type {
  ApiKeyAuthClient,
  ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key"
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
import { Fragment, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  organizationId,
  isPending: isPendingProp,
  hideCreate,
  hideDelete,
  hideUpdate
}: ApiKeysProps) {
  const { authClient } = useAuth<ApiKeyAuthClient>()
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
  } = useListApiKeys(authClient, {
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
        <h2 className="truncate text-sm font-semibold">
          {apiKeyLocalization.apiKeys}
        </h2>

        {!hideCreate && (
          <Button
            className="shrink-0"
            size="sm"
            disabled={isPending}
            onClick={() => setCreateOpen(true)}
          >
            {apiKeyLocalization.createApiKey}
          </Button>
        )}
      </div>
      <Select
        value={sort}
        onValueChange={(value) => {
          const [id, direction] = value.split(":")
          table.setSorting([{ id, desc: direction === "desc" }])
        }}
      >
        <SelectTrigger aria-label={apiKeyLocalization.sortBy}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt:desc">
            {apiKeyLocalization.newest}
          </SelectItem>
          <SelectItem value="createdAt:asc">
            {apiKeyLocalization.oldest}
          </SelectItem>
          <SelectItem value="name:asc">
            {apiKeyLocalization.nameAscending}
          </SelectItem>
          <SelectItem value="name:desc">
            {apiKeyLocalization.nameDescending}
          </SelectItem>
        </SelectContent>
      </Select>

      <Card className="p-0">
        <CardContent className="p-0">
          {isPending ? (
            <ApiKeySkeleton />
          ) : page.rows.length === 0 ? (
            <ApiKeysEmpty
              onCreatePress={() => setCreateOpen(true)}
              hideCreate={hideCreate}
            />
          ) : (
            <ItemGroup className="gap-0">
              {table.getRowModel().rows.map((row, index) => (
                <Fragment key={row.id}>
                  {index > 0 && <ItemSeparator />}
                  <ApiKey
                    apiKey={row.original}
                    hideDelete={hideDelete}
                    hideUpdate={hideUpdate}
                    organizationId={organizationId}
                  />
                </Fragment>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
      {(pagination.pageIndex > 0 || page.hasNextPage) && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            {apiKeyLocalization.previousPage}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!page.hasNextPage}
            onClick={() => table.nextPage()}
          >
            {apiKeyLocalization.nextPage}
          </Button>
        </div>
      )}

      {!hideCreate && (
        <CreateApiKeyDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          organizationId={organizationId}
        />
      )}
    </div>
  )
}
