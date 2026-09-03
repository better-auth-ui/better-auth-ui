import type { AppSolidTable, RowData } from "@tanstack/solid-table"
import { For, type JSX, Show } from "solid-js"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import type { organizationTableFeatures } from "../src/components/auth/organization/organization-table"

type OrganizationTableInstance<TData extends RowData> = AppSolidTable<
  typeof organizationTableFeatures,
  TData,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>

export function OrganizationTableRenderer<TData extends RowData>(props: {
  empty: JSX.Element
  table: OrganizationTableInstance<TData>
}) {
  return (
    <Table>
      <TableHeader>
        <For each={props.table.getHeaderGroups()}>
          {(headerGroup) => (
            <TableRow>
              <For each={headerGroup.headers}>
                {(header) => (
                  <TableHead colspan={header.colSpan}>
                    <Show when={!header.isPlaceholder}>
                      <props.table.FlexRender header={header} />
                    </Show>
                  </TableHead>
                )}
              </For>
            </TableRow>
          )}
        </For>
      </TableHeader>
      <TableBody>
        <Show
          fallback={
            <TableRow>
              <TableCell colspan={props.table.getVisibleLeafColumns().length}>
                {props.empty}
              </TableCell>
            </TableRow>
          }
          when={props.table.getRowModel().rows.length}
        >
          <For each={props.table.getRowModel().rows}>
            {(row) => (
              <TableRow
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                <For each={row.getVisibleCells()}>
                  {(cell) => (
                    <TableCell>
                      <props.table.FlexRender cell={cell} />
                    </TableCell>
                  )}
                </For>
              </TableRow>
            )}
          </For>
        </Show>
      </TableBody>
    </Table>
  )
}
