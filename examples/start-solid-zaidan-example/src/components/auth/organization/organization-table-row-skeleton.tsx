import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { For } from "solid-js"
import type { JSX } from "solid-js"

/** Placeholder cells for the table's current visible columns. */
export function OrganizationTableRowSkeleton(props: {
  columnIds: readonly string[]
}) {
  const cells: Record<string, () => JSX.Element> = {
    select: () => <Skeleton class="size-4 rounded-md" />,
    user: () => (
      <div class="flex items-center gap-3">
        <Skeleton class="size-8 rounded-full" />
        <div class="grid gap-1">
          <Skeleton class="h-4 w-32 rounded-md" />
          <Skeleton class="h-3 w-44 rounded-md" />
        </div>
      </div>
    ),
    email: () => <Skeleton class="h-4 w-48 rounded-md" />,
    createdAt: () => <Skeleton class="h-4 w-36 rounded-md" />,
    role: () => <Skeleton class="h-4 w-16 rounded-md" />,
    teams: () => <Skeleton class="h-4 w-24 rounded-md" />,
    status: () => <Skeleton class="h-4 w-14 rounded-full" />,
    actions: () => (
      <div class="flex justify-end">
        <Skeleton class="size-8 rounded-md" />
      </div>
    )
  }
  return (
    <TableRow>
      <For each={props.columnIds}>
        {(id) => <TableCell>{cells[id]()}</TableCell>}
      </For>
    </TableRow>
  )
}
