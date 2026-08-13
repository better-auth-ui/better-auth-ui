"use client"

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins"
import type { ReactTable, RowData } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { organizationTableFeatures } from "@/lib/table/organization-table-features"

export type OrganizationTablePaginationProps<TData extends RowData> = {
  table: ReactTable<typeof organizationTableFeatures, TData>
  localization: OrganizationLocalization
}

/**
 * Previous/next pagination controls for organization data tables (members,
 * invitations). Renders nothing once every row fits on a single page.
 */
export function OrganizationTablePagination<TData extends RowData>({
  table,
  localization
}: OrganizationTablePaginationProps<TData>) {
  const pageCount = table.getPageCount()

  if (pageCount <= 1) {
    return null
  }

  const { pageIndex } = table.state.pagination

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-muted-foreground text-xs">
        {localization.pageOf
          .replace("{{page}}", String(pageIndex + 1))
          .replace("{{pageCount}}", String(pageCount))}
      </p>

      <div className="flex items-center gap-1">
        <Button
          aria-label={localization.previousPage}
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronLeft />
        </Button>

        <Button
          aria-label={localization.nextPage}
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
