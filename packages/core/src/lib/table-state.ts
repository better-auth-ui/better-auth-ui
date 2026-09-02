export type TableSortingEntry = {
  desc: boolean
  id: string
}

export type TableColumnVisibility = Record<string, boolean>

const TABLE_STATE_VERSION = 1

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

export function getLookaheadPage<T>(items: readonly T[], pageSize: number) {
  const normalizedPageSize = Math.max(1, Math.floor(pageSize))
  return {
    hasNextPage: items.length > normalizedPageSize,
    rows: items.slice(0, normalizedPageSize)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
