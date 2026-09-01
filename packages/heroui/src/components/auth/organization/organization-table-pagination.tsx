import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Button } from "@heroui/react"

export function OrganizationTablePagination({
  disabled,
  onNextPage,
  onPreviousPage,
  pageIndex,
  pageSize,
  rowCount,
  visibleRowCount,
  canNextPage,
  canPreviousPage,
  localization
}: {
  disabled?: boolean
  onNextPage: () => void
  onPreviousPage: () => void
  pageIndex: number
  pageSize: number
  rowCount: number
  visibleRowCount: number
  canNextPage: boolean
  canPreviousPage: boolean
  localization: OrganizationLocalization
}) {
  if (rowCount <= pageSize) return null

  const pageStart = pageIndex * pageSize
  const from = pageStart + 1
  const to = Math.min(pageStart + visibleRowCount, rowCount)

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-muted text-sm tabular-nums">
        {localization.paginationRange
          .replace("{{from}}", String(from))
          .replace("{{to}}", String(to))
          .replace("{{total}}", String(rowCount))}
      </p>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          isDisabled={disabled || !canPreviousPage}
          onPress={onPreviousPage}
        >
          {localization.previousPage}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          isDisabled={disabled || !canNextPage}
          onPress={onNextPage}
        >
          {localization.nextPage}
        </Button>
      </div>
    </div>
  )
}
