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
