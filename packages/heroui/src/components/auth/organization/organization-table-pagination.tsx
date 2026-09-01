import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Button, Dropdown, Label } from "@heroui/react"
import { ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS } from "./organization-table-state"

export function OrganizationTablePagination({
  disabled,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPageSizeChange,
  onPreviousPage,
  pageCount,
  pageIndex,
  pageSize,
  rowCount,
  visibleRowCount,
  canNextPage,
  canPreviousPage,
  localization
}: {
  disabled?: boolean
  onFirstPage: () => void
  onLastPage: () => void
  onNextPage: () => void
  onPageSizeChange: (pageSize: number) => void
  onPreviousPage: () => void
  pageCount: number
  pageIndex: number
  pageSize: number
  rowCount: number
  visibleRowCount: number
  canNextPage: boolean
  canPreviousPage: boolean
  localization: OrganizationLocalization
}) {
  if (!rowCount) return null
  const pageStart = pageIndex * pageSize
  const from = pageStart + 1
  const to = Math.min(pageStart + visibleRowCount, rowCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-muted text-sm tabular-nums">
        {localization.paginationRange
          .replace("{{from}}", String(from))
          .replace("{{to}}", String(to))
          .replace("{{total}}", String(rowCount))}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Dropdown>
          <Button size="sm" variant="secondary" isDisabled={disabled}>
            {localization.rowsPerPage}: {pageSize}
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              selectionMode="single"
              selectedKeys={new Set([String(pageSize)])}
              onSelectionChange={(keys) => {
                const value = Number([...keys][0])
                if (Number.isSafeInteger(value)) onPageSizeChange(value)
              }}
            >
              {Array.from(
                new Set([...ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS, pageSize])
              )
                .sort((left, right) => left - right)
                .map((option) => (
                  <Dropdown.Item
                    id={String(option)}
                    key={option}
                    textValue={String(option)}
                  >
                    <Label>{option}</Label>
                    <Dropdown.ItemIndicator />
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
        <span className="text-muted min-w-20 text-center text-sm tabular-nums">
          {localization.pageOf
            .replace("{{page}}", String(pageIndex + 1))
            .replace("{{pages}}", String(Math.max(pageCount, 1)))}
        </span>
        <Button
          size="sm"
          variant="secondary"
          isDisabled={disabled || !canPreviousPage}
          onPress={onFirstPage}
        >
          {localization.firstPage}
        </Button>
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
        <Button
          size="sm"
          variant="secondary"
          isDisabled={disabled || !canNextPage}
          onPress={onLastPage}
        >
          {localization.lastPage}
        </Button>
      </div>
    </div>
  )
}
