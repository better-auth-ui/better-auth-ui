"use client"

import { ChevronUp } from "lucide-react"
import type { MouseEvent, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type SortableColumn = {
  getIsSorted: () => false | "asc" | "desc"
  getSortIndex: () => number
  getToggleSortingHandler: () => undefined | ((event: unknown) => void)
}

export function OrganizationSortableTableHead({
  children,
  column
}: {
  children: ReactNode
  column?: SortableColumn
}) {
  if (!column) return <TableHead>{children}</TableHead>

  const sortDirection = column.getIsSorted()
  const onClick = column.getToggleSortingHandler()

  return (
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

        {sortDirection && (
          <>
            <ChevronUp
              className={cn(
                "size-3 transition-transform duration-100 ease-out",
                sortDirection === "desc" && "rotate-180"
              )}
            />
            <span className="text-muted-foreground text-[10px] tabular-nums">
              {column.getSortIndex() + 1}
            </span>
          </>
        )}
      </Button>
    </TableHead>
  )
}
