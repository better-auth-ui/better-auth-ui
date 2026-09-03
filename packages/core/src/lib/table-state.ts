export type TableSortingEntry = {
  desc: boolean
  id: string
}

export type TableColumnVisibility = Record<string, boolean>
export type TableFilterValue =
  | boolean
  | number
  | string
  | null
  | readonly (boolean | number | string | null)[]

export type TableUrlState = {
  columnFilters: { id: string; value: TableFilterValue }[]
  globalFilter: string
  pagination: { pageIndex: number; pageSize: number }
  sorting: TableSortingEntry[]
}

export type TableSearchParamsAdapter = {
  read: () => URLSearchParams
  replace: (params: URLSearchParams) => void
  subscribe: (listener: () => void) => () => void
}

export type TableStorageAdapter = {
  read: (key: string) => string | null
  write: (key: string, value: string) => void
}

export type TablePersistenceAdapters = {
  search: TableSearchParamsAdapter
  storage?: TableStorageAdapter
}

export const DEFAULT_TABLE_SEARCH_DEBOUNCE_MS = 300

/**
 * Create a search adapter from a router's search and navigation primitives.
 *
 * TanStack Router consumers can pass `router.state.location.searchStr` from
 * `read`, use `router.navigate({ replace: true, search })` from `replace`, and
 * subscribe to router state changes from `subscribe`. Other routers can expose
 * the same three operations without coupling the table package to that router.
 */
export function createTableSearchParamsAdapter(
  adapter: TableSearchParamsAdapter
): TableSearchParamsAdapter {
  return adapter
}

/** Create browser-backed persistence for tables outside a router context. */
export function createBrowserTablePersistenceAdapters(): TablePersistenceAdapters {
  return {
    search: {
      read: () =>
        typeof window === "undefined"
          ? new URLSearchParams()
          : new URLSearchParams(window.location.search),
      replace: (params) => {
        if (typeof window === "undefined") return
        const url = new URL(window.location.href)
        url.search = params.toString()
        window.history.replaceState(window.history.state, "", url)
      },
      subscribe: (listener) => {
        if (typeof window === "undefined") return () => undefined
        window.addEventListener("popstate", listener)
        return () => window.removeEventListener("popstate", listener)
      }
    },
    storage:
      typeof window === "undefined"
        ? undefined
        : {
            read: (key) => window.localStorage.getItem(key),
            write: (key, value) => window.localStorage.setItem(key, value)
          }
  }
}

const TABLE_STATE_VERSION = 1
const TABLE_FILTER_VALUE_PREFIX = "~"

export function parseTablePage(
  value: string | null,
  fallback: number,
  maximum = 10_000
) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximum
    ? parsed
    : fallback
}

export function parseTablePageSize(
  value: string | null,
  fallback: number,
  allowedPageSizes: readonly number[]
) {
  const parsed = Number(value)
  return allowedPageSizes.includes(parsed) ? parsed : fallback
}

export function parseTableSorting(
  value: string | null,
  allowedColumnIds?: readonly string[],
  maximumEntries = 3
): TableSortingEntry[] {
  if (!value) return []

  const allowed = allowedColumnIds ? new Set(allowedColumnIds) : undefined
  const seen = new Set<string>()

  return value.split(",").flatMap((entry) => {
    if (seen.size >= maximumEntries) return []

    const [id, direction, ...extra] = entry.split(".")
    if (
      !id ||
      extra.length > 0 ||
      (direction !== "asc" && direction !== "desc") ||
      allowed?.has(id) === false ||
      seen.has(id)
    ) {
      return []
    }

    seen.add(id)
    return [{ desc: direction === "desc", id }]
  })
}

export function parseTableColumnVisibility(
  value: string | null,
  allowedColumnIds?: readonly string[]
): TableColumnVisibility {
  if (!value) return {}

  try {
    const parsed: unknown = JSON.parse(value)
    const candidate =
      isRecord(parsed) &&
      parsed.version === TABLE_STATE_VERSION &&
      isRecord(parsed.columns)
        ? parsed.columns
        : parsed

    if (!isRecord(candidate)) return {}

    const allowed = allowedColumnIds ? new Set(allowedColumnIds) : undefined
    const columns: TableColumnVisibility = {}
    for (const [id, visible] of Object.entries(candidate)) {
      if (typeof visible === "boolean" && allowed?.has(id) !== false) {
        columns[id] = visible
      }
    }
    return columns
  } catch {
    return {}
  }
}

export function serializeTableColumnVisibility(columns: TableColumnVisibility) {
  return JSON.stringify({ columns, version: TABLE_STATE_VERSION })
}

export function parseTableFilterValue(value: string): TableFilterValue {
  if (!value.startsWith(TABLE_FILTER_VALUE_PREFIX)) return value

  try {
    const parsed: unknown = JSON.parse(
      value.slice(TABLE_FILTER_VALUE_PREFIX.length)
    )
    return isTableFilterValue(parsed) ? parsed : value
  } catch {
    return value
  }
}

export function serializeTableFilterValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    if (!value) return undefined
    return value.startsWith(TABLE_FILTER_VALUE_PREFIX)
      ? `${TABLE_FILTER_VALUE_PREFIX}${JSON.stringify(value)}`
      : value
  }
  if (!isTableFilterValue(value)) return undefined
  return `${TABLE_FILTER_VALUE_PREFIX}${JSON.stringify(value)}`
}

/** Parse one namespaced table state from URL search parameters. */
export function parseTableUrlState(
  params: URLSearchParams,
  stateKey: string,
  defaultPageSize: number,
  allowedPageSizes: readonly number[],
  allowedColumnIds?: readonly string[]
): TableUrlState {
  const filterPrefix = `${stateKey}.filter.`
  const columnFilters: TableUrlState["columnFilters"] = []

  for (const [key, value] of params) {
    const id = key.slice(filterPrefix.length)
    if (
      key.startsWith(filterPrefix) &&
      value &&
      (!allowedColumnIds || allowedColumnIds.includes(id))
    ) {
      columnFilters.push({ id, value: parseTableFilterValue(value) })
    }
  }

  return {
    columnFilters,
    globalFilter: params.get(`${stateKey}.search`) ?? "",
    pagination: {
      pageIndex: parseTablePage(params.get(`${stateKey}.page`), 1) - 1,
      pageSize: parseTablePageSize(
        params.get(`${stateKey}.pageSize`),
        defaultPageSize,
        allowedPageSizes
      )
    },
    sorting: parseTableSorting(params.get(`${stateKey}.sort`), allowedColumnIds)
  }
}

/** Write one namespaced table state without changing unrelated parameters. */
export function serializeTableUrlState(
  source: URLSearchParams,
  stateKey: string,
  defaultPageSize: number,
  state: {
    columnFilters: readonly { id: string; value: unknown }[]
    globalFilter: string
    pagination: { pageIndex: number; pageSize: number }
    sorting: readonly TableSortingEntry[]
  }
) {
  const params = new URLSearchParams(source)
  const filterPrefix = `${stateKey}.filter.`

  for (const key of Array.from(params.keys())) {
    if (key.startsWith(filterPrefix)) params.delete(key)
  }

  for (const filter of state.columnFilters) {
    const value = serializeTableFilterValue(filter.value)
    if (value) params.set(`${filterPrefix}${filter.id}`, value)
  }

  setOrDelete(params, `${stateKey}.search`, state.globalFilter)
  setOrDelete(
    params,
    `${stateKey}.page`,
    String(state.pagination.pageIndex + 1),
    "1"
  )
  setOrDelete(
    params,
    `${stateKey}.pageSize`,
    String(state.pagination.pageSize),
    String(defaultPageSize)
  )
  setOrDelete(
    params,
    `${stateKey}.sort`,
    state.sorting
      .map(({ desc, id }) => `${id}.${desc ? "desc" : "asc"}`)
      .join(",")
  )

  return params
}

export function getLookaheadPage<T>(items: readonly T[], pageSize: number) {
  const normalizedPageSize = Math.max(1, Math.floor(pageSize))
  return {
    hasNextPage: items.length > normalizedPageSize,
    rows: items.slice(0, normalizedPageSize)
  }
}

/** Returns the nearest valid zero-based page index for a result count. */
export function getClampedTablePageIndex(
  pageIndex: number,
  pageSize: number,
  rowCount: number
) {
  const normalizedPageSize = Number.isFinite(pageSize)
    ? Math.max(1, Math.floor(pageSize))
    : 1
  const normalizedRowCount = Number.isFinite(rowCount)
    ? Math.max(0, Math.floor(rowCount))
    : 0
  const lastPageIndex = Math.max(
    0,
    Math.ceil(normalizedRowCount / normalizedPageSize) - 1
  )

  const normalizedPageIndex = Number.isFinite(pageIndex)
    ? Math.max(0, Math.floor(pageIndex))
    : 0

  return Math.min(normalizedPageIndex, lastPageIndex)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function setOrDelete(
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue = ""
) {
  if (value === defaultValue) params.delete(key)
  else params.set(key, value)
}

function isTableFilterPrimitive(
  value: unknown
): value is boolean | number | string | null {
  return (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    typeof value === "string"
  )
}

function isTableFilterValue(value: unknown): value is TableFilterValue {
  return (
    isTableFilterPrimitive(value) ||
    (Array.isArray(value) && value.every(isTableFilterPrimitive))
  )
}
