"use client"

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
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
  if (rowCount === 0) return null

  const pageStart = pageIndex * pageSize
  const from = pageStart + 1
  const to = Math.min(pageStart + visibleRowCount, rowCount)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm tabular-nums">
        {localization.paginationRange
          .replace("{{from}}", String(from))
          .replace("{{to}}", String(to))
          .replace("{{total}}", String(rowCount))}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            disabled={disabled}
          >
            {localization.rowsPerPage}: {pageSize}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              {Array.from(
                new Set([...ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS, pageSize])
              )
                .sort((left, right) => left - right)
                .map((size) => (
                  <DropdownMenuRadioItem key={size} value={String(size)}>
                    {size}
                  </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-muted-foreground text-sm tabular-nums">
          {localization.pageOf
            .replace("{{page}}", String(pageIndex + 1))
            .replace("{{pages}}", String(Math.max(1, pageCount)))}
        </span>

        <Button
          aria-label={localization.firstPage}
          size="icon-sm"
          variant="outline"
          disabled={disabled || !canPreviousPage}
          onClick={onFirstPage}
        >
          <ChevronsLeft />
        </Button>

        <Button
          aria-label={localization.previousPage}
          size="icon-sm"
          variant="outline"
          disabled={disabled || !canPreviousPage}
          onClick={onPreviousPage}
        >
          <ChevronLeft />
        </Button>

        <Button
          aria-label={localization.nextPage}
          size="icon-sm"
          variant="outline"
          disabled={disabled || !canNextPage}
          onClick={onNextPage}
        >
          <ChevronRight />
        </Button>

        <Button
          aria-label={localization.lastPage}
          size="icon-sm"
          variant="outline"
          disabled={disabled || !canNextPage}
          onClick={onLastPage}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  )
}
