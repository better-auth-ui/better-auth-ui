import { ChevronUp } from "@gravity-ui/icons"
import { Button, cn } from "@heroui/react"
import { type Column, type RowData, Subscribe } from "@tanstack/react-table"
import type { ReactNode } from "react"
import type { organizationTableFeatures } from "./organization-table"

export function OrganizationSortableTableHeader<TData extends RowData>({
  children,
  column,
  interactive = true
}: {
  children: ReactNode
  column?: Column<typeof organizationTableFeatures, TData>
  interactive?: boolean
}) {
  const onPress = column?.getToggleSortingHandler()

  if (!column || !onPress) return children

  return (
    <Subscribe
      source={column.table.atoms.sorting}
      selector={() => [column.getIsSorted(), column.getSortIndex()] as const}
    >
      {([sortDirection, sortIndex]) => {
        const content = (
          <>
            {children}
            {sortDirection ? (
              <>
                <ChevronUp
                  className={cn(
                    "size-3 transition-transform duration-100 ease-out",
                    sortDirection === "desc" && "rotate-180"
                  )}
                />
                <span className="text-muted text-[10px] tabular-nums">
                  {sortIndex + 1}
                </span>
              </>
            ) : null}
          </>
        )

        return interactive ? (
          <Button
            className="h-auto min-w-0 justify-start gap-1 p-0 font-medium"
            onPress={(event) => onPress(event)}
            size="sm"
            variant="tertiary"
          >
            {content}
          </Button>
        ) : (
          <span className="flex items-center gap-1">{content}</span>
        )
      }}
    </Subscribe>
  )
}
