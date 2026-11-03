import { getLookaheadPage } from "@better-auth-ui/core"
import {
  listApiKeysOptions,
  type ListedApiKey
} from "@better-auth-ui/core/plugins/api-key"
import { useQuery, skipToken } from "@tanstack/react-query"
import { useServerTableState } from "../server-table-state"
import {
  columnFilteringFeature,
  globalFilteringFeature,
  createFilteredRowModel,
  filterFn_includesString,
  createTableHook,
  rowPaginationFeature,
  createPaginatedRowModel,
  rowSortingFeature,
  createSortedRowModel,
  tableFeatures
} from "@tanstack/react-table"
import type { ApiKeyAuthClient } from "@better-auth-ui/core/plugins/api-key"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key"
import { useEffect, useMemo, useState } from "react"
import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { SearchField } from "../../../primitives/inputs-extra"
import { Select } from "../../../primitives/menu"
import { Box, Txt } from "../../../primitives/styled"
import { ApiKey } from "./api-key"
import { ApiKeySkeleton } from "./api-key-skeleton"
import { ApiKeysEmpty } from "./api-keys-empty"
import { CreateApiKeyDialog } from "./create-api-key-dialog"
const { createAppColumnHelper, useAppTable: useApiKeyTable } = createTableHook({
  enableMultiSort: false,
  features: tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: { includesString: filterFn_includesString },
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel()
  })
})
const helper = createAppColumnHelper<ListedApiKey>()
const columns = helper.columns([
  helper.accessor("name", {
    id: "name",
    filterFn: "includesString",
    sortFn: (a, b) =>
      (a.original.name ?? "").localeCompare(b.original.name ?? "")
  }),
  helper.accessor("createdAt", {
    id: "createdAt",
    enableGlobalFilter: false,
    sortFn: (a, b) =>
      +new Date(a.original.createdAt) - +new Date(b.original.createdAt)
  })
])
const EMPTY_KEYS: ListedApiKey[] = []

/** The endpoint has no name filter, so search needs a complete client-side result. */
function useSearchableApiKeys(
  client: ApiKeyAuthClient,
  configId: string,
  organizationId: string | undefined,
  enabled: boolean
) {
  const session = useSession(client)
  const query = { configId, organizationId, limit: 100, offset: 0 }
  const options = listApiKeysOptions(client, session.data?.user.id, { query })
  return useQuery({
    ...options,
    enabled,
    queryKey: [...options.queryKey, "native-all"],
    queryFn: session.data?.user.id
      ? async ({ signal }) => {
          const apiKeys: ListedApiKey[] = []
          while (true) {
            const page = await client.apiKey.list({
              query: { ...query, offset: apiKeys.length },
              fetchOptions: { throw: true, signal }
            })
            apiKeys.push(...page.apiKeys)
            if (page.apiKeys.length < query.limit) break
          }
          return { apiKeys }
        }
      : skipToken
  })
}

export type ApiKeysProps = SettingsViewProps & {
  organizationId?: string
  isPending?: boolean
  hideCreate?: boolean
  hideDelete?: boolean
  hideUpdate?: boolean
}
export function ApiKeys({
  organizationId,
  isPending: loading,
  hideCreate,
  hideDelete,
  hideUpdate,
  ...props
}: ApiKeysProps) {
  const { authClient } = useAuth()
  const { localization, configurations, pageSize } = useAuthPlugin(apiKeyPlugin)
  const configs = configurations.filter(
    (config) => !!config.organization === !!organizationId
  )
  const [configuration, setConfiguration] = useState(
    configs[0]?.id ?? (organizationId ? "organization" : "default")
  )
  const tableState = useServerTableState({
    pageSize,
    initialSorting: [{ id: "createdAt", desc: true }]
  })
  const { pagination, sorting, globalFilter: search, atoms } = tableState
  const setSearch = (value: string) => atoms.globalFilter.set(value)
  const setPage = (pageIndex: number) =>
    tableState.setPagination((current) => ({ ...current, pageIndex }))
  const sortBy = sorting[0]?.id === "name" ? "name" : "createdAt"
  const sortDirection = sorting[0]?.desc ? "desc" : "asc"
  const sort =
    sortBy === "name"
      ? sortDirection === "asc"
        ? "name"
        : "name-desc"
      : sortDirection === "asc"
        ? "oldest"
        : "newest"
  const setSort = (value: string) =>
    atoms.sorting.set([
      {
        id: value.startsWith("name") ? "name" : "createdAt",
        desc: value === "newest" || value === "name-desc"
      }
    ])
  const searching = !!search.trim()
  const [createOpen, setCreateOpen] = useState(false)
  const keys = useListApiKeys(authClient as ApiKeyAuthClient, {
    enabled: !loading && !searching,
    query: {
      configId: configuration,
      limit: pagination.pageSize + 1,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy,
      sortDirection,
      ...(organizationId ? { organizationId } : {})
    }
  })
  const all = useSearchableApiKeys(
    authClient as ApiKeyAuthClient,
    configuration,
    organizationId,
    !loading && searching
  )
  const page = useMemo(
    () =>
      getLookaheadPage(keys.data?.apiKeys ?? EMPTY_KEYS, pagination.pageSize),
    [keys.data?.apiKeys, pagination.pageSize]
  )
  const table = useApiKeyTable({
    atoms,
    columns,
    data: searching ? (all.data?.apiKeys ?? EMPTY_KEYS) : page.rows,
    getRowId: (key) => key.id,
    manualFiltering: !searching,
    manualPagination: !searching,
    manualSorting: !searching,
    pageCount: searching ? undefined : -1
  })
  const rows = table.getRowModel().rows
  const query = searching ? all : keys
  const pending = loading || query.isPending
  const current = pagination.pageIndex
  const hasNextPage = searching ? table.getCanNextPage() : page.hasNextPage
  useEffect(() => {
    if (
      !query.isSuccess ||
      query.isPlaceholderData ||
      current === 0 ||
      rows.length
    )
      return
    tableState.setPagination((value) => ({
      ...value,
      pageIndex: Math.max(0, value.pageIndex - 1)
    }))
  }, [
    query.isSuccess,
    query.isPlaceholderData,
    current,
    rows.length,
    tableState.setPagination
  ])
  useEffect(() => {
    tableState.setPagination((value) => ({ ...value, pageIndex: 0 }))
  }, [configuration, organizationId, tableState.setPagination])

  return (
    <Box className={props.className ?? "gap-3"}>
      <Txt className="font-semibold">{localization.apiKeys}</Txt>
      {configs.length ? (
        <Select
          label={localization.configuration}
          selectedKey={configuration}
          onSelectionChange={(value) => {
            setConfiguration(value)
            setPage(0)
          }}
          options={configs.map((config) => ({
            key: config.id,
            label: config.label
          }))}
        />
      ) : null}
      {!hideCreate ? (
        <Button isDisabled={pending} onPress={() => setCreateOpen(true)}>
          {localization.createApiKey}
        </Button>
      ) : null}
      <SearchField
        value={search}
        onChangeText={(value) => {
          setSearch(value)
          setPage(0)
        }}
        aria-label={localization.name}
      />
      <Select
        label={localization.sortBy}
        selectedKey={sort}
        onSelectionChange={(value) => {
          setSort(value)
          setPage(0)
        }}
        options={[
          { key: "newest", label: localization.newest },
          { key: "oldest", label: localization.oldest },
          { key: "name", label: localization.nameAscending },
          { key: "name-desc", label: localization.nameDescending }
        ]}
      />
      <Card variant={props.variant}>
        <Card.Content className="gap-4">
          {pending ? (
            <ApiKeySkeleton />
          ) : query.error ? (
            <Txt accessibilityRole="alert">{query.error.message}</Txt>
          ) : !rows.length ? (
            <ApiKeysEmpty
              hideCreate={hideCreate}
              onCreatePress={() => setCreateOpen(true)}
            />
          ) : (
            rows.map(({ original: key }) => (
              <ApiKey
                key={key.id}
                apiKey={key}
                configId={configuration}
                hideDelete={hideDelete}
                hideUpdate={hideUpdate}
                organizationId={organizationId}
              />
            ))
          )}
        </Card.Content>
      </Card>
      <Box className="flex-row gap-3">
        <Button isDisabled={current === 0} onPress={() => setPage(current - 1)}>
          {localization.previousPage}
        </Button>
        <Txt>{current + 1}</Txt>
        <Button
          isDisabled={pending || !hasNextPage}
          onPress={() => setPage(current + 1)}
        >
          {localization.nextPage}
        </Button>
      </Box>
      {!hideCreate ? (
        <CreateApiKeyDialog
          key={configuration}
          isOpen={createOpen}
          onOpenChange={setCreateOpen}
          configId={configuration}
          organizationId={organizationId}
        />
      ) : null}
    </Box>
  )
}
