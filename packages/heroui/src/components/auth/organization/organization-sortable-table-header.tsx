import { ChevronUp } from "@gravity-ui/icons"
import { Button, cn } from "@heroui/react"
import type { ReactNode } from "react"

type SortableColumn = {
  getCanSort: () => boolean
  getIsSorted: () => false | "asc" | "desc"
  getSortIndex: () => number
  getToggleSortingHandler: () => undefined | ((event: unknown) => void)
}

export function OrganizationSortableTableHeader({
  children,
  column
}: {
  children: ReactNode
  column?: SortableColumn
}) {
  const sortDirection = column?.getIsSorted()
  const onPress = column?.getToggleSortingHandler()

  if (!onPress) return children

  return (
    <Button
      className="h-auto min-w-0 justify-start gap-1 p-0 font-medium"
      onPress={(event) => onPress(event)}
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
            {(column?.getSortIndex() ?? 0) + 1}
          </span>
        </>
      )}
    </Button>
  )
}
