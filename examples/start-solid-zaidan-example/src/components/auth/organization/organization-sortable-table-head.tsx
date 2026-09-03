import type { Column, RowData } from "@tanstack/solid-table"
import { ChevronUp } from "lucide-solid"
import type { JSX } from "solid-js"
import { Show } from "solid-js"

import { Button } from "@/components/ui/button"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { organizationTableFeatures } from "./organization-table"

export function OrganizationSortableTableHead<TData extends RowData>(props: {
  children: JSX.Element
  column?: Column<typeof organizationTableFeatures, TData>
}) {
  const column = props.column

  if (!column) return <TableHead>{props.children}</TableHead>

  const sortDirection = () => column.getIsSorted()

  return (
    <TableHead
      aria-sort={
        sortDirection() === "asc"
          ? "ascending"
          : sortDirection() === "desc"
            ? "descending"
            : "none"
      }
    >
      <Button
        class="h-auto w-full justify-start p-0 font-medium hover:bg-transparent"
        onClick={(event) => column.getToggleSortingHandler()?.(event)}
        size="sm"
        type="button"
        variant="ghost"
      >
        {props.children}
        <Show when={sortDirection()}>
          <ChevronUp
            class={cn(
              "size-3 transition-transform duration-100 ease-out",
              sortDirection() === "desc" && "rotate-180"
            )}
          />
          <span class="text-muted-foreground text-[10px] tabular-nums">
            {column.getSortIndex() + 1}
          </span>
        </Show>
      </Button>
    </TableHead>
  )
}
