import { Show } from "solid-js"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

export function OrganizationMemberRowSkeleton(props: { showTeams?: boolean }) {
  return (
    <TableRow>
      <TableCell>
        <div class="flex items-center gap-3">
          <Skeleton class="size-8 rounded-full" />
          <div class="grid gap-1">
            <Skeleton class="h-4 w-32 rounded-md" />
            <Skeleton class="h-3 w-44 rounded-md" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton class="h-4 w-40 rounded-md" />
      </TableCell>
      <Show when={props.showTeams}>
        <TableCell>
          <Skeleton class="h-4 w-24 rounded-md" />
        </TableCell>
      </Show>
      <TableCell class="text-right">
        <div class="flex justify-end gap-2">
          <Skeleton class="size-8 rounded-md" />
          <Skeleton class="size-8 rounded-md" />
        </div>
      </TableCell>
    </TableRow>
  )
}
