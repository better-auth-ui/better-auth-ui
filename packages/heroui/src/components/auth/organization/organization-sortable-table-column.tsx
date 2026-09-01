import { ChevronUp } from "@gravity-ui/icons"
import { Button, cn, Table } from "@heroui/react"
import type { ReactNode } from "react"

type SortableColumn = {
  getIsSorted: () => false | "asc" | "desc"
  getSortIndex: () => number
  getToggleSortingHandler: () => undefined | ((event: unknown) => void)
}

export function OrganizationSortableTableColumn({
  children,
  column,
  isRowHeader
}: {
  children: ReactNode
  column?: SortableColumn
  isRowHeader?: boolean
}) {
  if (!column)
    return <Table.Column isRowHeader={isRowHeader}>{children}</Table.Column>

  const sortDirection = column.getIsSorted()
  const onPress = column.getToggleSortingHandler()

  return (
    <Table.Column
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : "none"
      }
      isRowHeader={isRowHeader}
    >
      <Button
        className="h-auto min-w-0 justify-start gap-1 p-0 font-medium"
        onPress={(event) => onPress?.(event)}
        size="sm"
        variant="tertiary"
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
            <span className="text-muted text-[10px] tabular-nums">
              {column.getSortIndex() + 1}
            </span>
          </>
        )}
      </Button>
    </Table.Column>
  )
}
