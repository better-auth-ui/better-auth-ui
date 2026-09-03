"use client"

import { type Column, type RowData, Subscribe } from "@tanstack/react-table"
import { ChevronUp } from "lucide-react"
import type { MouseEvent, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { organizationTableFeatures } from "./organization-table"

export function OrganizationSortableTableHead<TData extends RowData>({
  children,
  column
}: {
  children: ReactNode
  column?: Column<typeof organizationTableFeatures, TData>
}) {
  if (!column) return <TableHead>{children}</TableHead>

  const onClick = column.getToggleSortingHandler()

  return (
    <Subscribe
      source={column.table.atoms.sorting}
      selector={() => [column.getIsSorted(), column.getSortIndex()] as const}
    >
      {([sortDirection, sortIndex]) => (
        <TableHead
          aria-sort={
            sortDirection === "asc"
              ? "ascending"
              : sortDirection === "desc"
                ? "descending"
                : "none"
          }
        >
          <Button
            className="h-auto w-full justify-start p-0 font-medium hover:bg-transparent"
            onClick={(event: MouseEvent<HTMLButtonElement>) => onClick?.(event)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {children}

            {sortDirection ? (
              <>
                <ChevronUp
                  className={cn(
                    "size-3 transition-transform duration-100 ease-out",
                    sortDirection === "desc" && "rotate-180"
                  )}
                />
                <span className="text-muted-foreground text-[10px] tabular-nums">
                  {sortIndex + 1}
                </span>
              </>
            ) : null}
          </Button>
        </TableHead>
      )}
    </Subscribe>
  )
}
