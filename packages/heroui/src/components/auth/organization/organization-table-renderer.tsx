import { Table } from "@heroui/react"
import type { ReactNode } from "react"
import {
  getHeroUISelection,
  getHeroUISortDescriptor,
  getTanStackRowSelection
} from "../table-bridge"
import { OrganizationSortableTableHeader } from "./organization-sortable-table-header"
import { useOrganizationTableContext } from "./organization-table"

export function OrganizationTableRenderer({
  ariaLabel,
  empty,
  selectable = false
}: {
  ariaLabel: string
  empty: ReactNode
  selectable?: boolean
}) {
  const table = useOrganizationTableContext()
  const rows = table.getRowModel().rows
  const rowIds = rows.map((row) => row.id)
  const rowHeaderColumn = table.getVisibleLeafColumns()[0]
  const sortDescriptor = getHeroUISortDescriptor(table.state.sorting)

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label={ariaLabel}
          onSelectionChange={(selection) =>
            table.setRowSelection(getTanStackRowSelection(selection, rowIds))
          }
          onSortChange={(descriptor) => {
            const column = table.getColumn(String(descriptor.column))
            const toggleSorting = column?.getToggleSortingHandler()
            toggleSorting?.({ shiftKey: table.state.sorting.length > 1 })
          }}
          selectedKeys={getHeroUISelection(table.state.rowSelection)}
          selectionMode={selectable ? "multiple" : "none"}
          sortDescriptor={sortDescriptor}
        >
          <Table.Header>
            {table.getHeaderGroups().flatMap((headerGroup) =>
              headerGroup.headers.map((header) => (
                <Table.Column
                  allowsSorting={header.column.getCanSort()}
                  id={header.column.id}
                  isRowHeader={header.column === rowHeaderColumn}
                  key={header.id}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <OrganizationSortableTableHeader
                      column={header.column}
                      interactive={false}
                    >
                      <table.FlexRender header={header} />
                    </OrganizationSortableTableHeader>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </Table.Column>
              ))
            )}
          </Table.Header>
          <Table.Body renderEmptyState={() => empty}>
            {rows.map((row) => (
              <Table.Row id={row.id} key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
