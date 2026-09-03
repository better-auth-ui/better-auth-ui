import { Table } from "@heroui/react"
import type { ReactNode } from "react"
import { OrganizationSortableTableHeader } from "../src/components/auth/organization/organization-sortable-table-header"
import { useOrganizationTableContext } from "../src/components/auth/organization/organization-table"
import {
  getHeroUISelection,
  getHeroUISortDescriptor,
  getTanStackRowSelection,
  getTanStackSorting
} from "../src/components/auth/table-bridge"

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
            table.setSorting(
              getTanStackSorting(descriptor, table.state.sorting)
            )
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
                  {({ sortDirection }) =>
                    header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <OrganizationSortableTableHeader
                        column={header.column}
                        interactive={false}
                        nativeSortDirection={sortDirection}
                      >
                        <table.FlexRender header={header} />
                      </OrganizationSortableTableHeader>
                    ) : (
                      <table.FlexRender header={header} />
                    )
                  }
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
