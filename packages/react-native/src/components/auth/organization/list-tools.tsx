import { getClampedTablePageIndex } from "@better-auth-ui/core"
import { functionalUpdate } from "@tanstack/react-table"
import {
  useOrganizationTable,
  createOrganizationColumnHelper
} from "./organization-table"
import type { useOrganizationTableState } from "./organization-table-state"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction
} from "react"
import { useAuthPlugin } from "@better-auth-ui/react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { Button } from "../../../primitives/button"
import { Checkbox } from "../../../primitives/checkbox"
import { Select, Menu } from "../../../primitives/menu"
import { Box, Txt } from "../../../primitives/styled"

export function useNativeList<T extends { id: string }>(
  items: readonly T[],
  columns: Record<string, string>,
  sorters: Record<string, (a: T, b: T) => number>,
  state: ReturnType<typeof useOrganizationTableState>,
  {
    manualPagination = false,
    rowCount,
    isPending = false,
    accessors = {}
  }: {
    manualPagination?: boolean
    rowCount?: number
    isPending?: boolean
    accessors?: Record<string, (row: T) => unknown>
  } = {}
) {
  const helper = useMemo(() => createOrganizationColumnHelper<T>(), [])
  const accessorRef = useRef(accessors)
  accessorRef.current = accessors
  const sorterRef = useRef(sorters)
  sorterRef.current = sorters
  const columnIds = [
    ...new Set([...Object.keys(columns), ...Object.keys(sorters)])
  ].join("\u0000")
  const tableColumns = useMemo(
    () =>
      helper.columns(
        columnIds.split("\u0000").map((id) =>
          helper.accessor(
            (row): unknown =>
              accessorRef.current[id]
                ? accessorRef.current[id](row)
                : Reflect.get(row, id),
            {
              id,
              enableSorting: !!sorterRef.current[id],
              sortFn: (a, b) =>
                sorterRef.current[id]?.(a.original, b.original) ?? 0
            }
          )
        )
      ),
    [columnIds, helper]
  )
  const data = useMemo(() => [...items], [items])
  const table = useOrganizationTable({
    atoms: state.atoms,
    columns: tableColumns,
    data,
    getRowId: (row) => row.id,
    manualFiltering: true,
    manualPagination,
    manualSorting: manualPagination,
    rowCount: manualPagination ? rowCount : undefined,
    autoResetPageIndex: false
  })
  const sort = state.sorting[0]?.id ?? Object.keys(sorters)[0] ?? ""
  useEffect(() => {
    if (state.ready && !state.sorting.length && sort)
      state.setSorting([{ id: sort, desc: false }])
  }, [state.ready, state.sorting.length, state.setSorting, sort])
  const count = manualPagination ? (rowCount ?? 0) : items.length
  const page = getClampedTablePageIndex(
    state.pagination.pageIndex,
    state.pagination.pageSize,
    count
  )
  useEffect(() => {
    if (!isPending && state.ready && page !== state.pagination.pageIndex)
      state.setPagination((current) => ({ ...current, pageIndex: page }))
  }, [
    isPending,
    state.ready,
    page,
    state.pagination.pageIndex,
    state.setPagination
  ])
  const selected = Object.keys(state.rowSelection).filter(
    (id) => state.rowSelection[id] && items.some((item) => item.id === id)
  )
  const visible = Object.keys(columns).filter(
    (id) => state.columnVisibility[id] !== false
  )
  const setSelected: Dispatch<SetStateAction<string[]>> = (updater) => {
    state.setRowSelection((current) => {
      const ids = Object.keys(current).filter(
        (id) => current[id] && items.some((item) => item.id === id)
      )
      return Object.fromEntries(
        functionalUpdate(updater, ids).map((id) => [id, true])
      )
    })
  }
  return {
    table,
    rows: table.getRowModel().rows.map((row) => row.original),
    sort,
    setSort: (id: string) => table.setSorting([{ id, desc: false }]),
    page,
    setPage: (pageIndex: number) => table.setPageIndex(pageIndex),
    lastPage: Math.max(0, Math.ceil(count / state.pagination.pageSize) - 1),
    selected,
    setSelected,
    visible,
    setVisible: (ids: string[]) =>
      table.setColumnVisibility(
        Object.fromEntries(
          Object.keys(columns).map((id) => [id, ids.includes(id)])
        )
      ),
    columns
  }
}
export function NativeListTools<T extends { id: string }>({
  list,
  sortLabels,
  selection = true,
  children
}: {
  list: ReturnType<typeof useNativeList<T>>
  sortLabels: Record<string, string>
  selection?: boolean
  children?: ReactNode
}) {
  const { localization } = useAuthPlugin(organizationPlugin)
  const [columnsOpen, setColumnsOpen] = useState(false)
  return (
    <Box className="gap-3">
      <Select
        selectedKey={list.sort}
        onSelectionChange={list.setSort}
        options={Object.entries(sortLabels).map(([id, label]) => ({
          key: id,
          label
        }))}
      />
      <Button variant="secondary" onPress={() => setColumnsOpen(true)}>
        {localization.columns}
      </Button>
      <Menu isOpen={columnsOpen} onOpenChange={setColumnsOpen}>
        {Object.entries(list.columns).map(([id, label]) => (
          <Checkbox
            key={id}
            isSelected={list.visible.includes(id)}
            onChange={(checked) =>
              list.setVisible(
                checked
                  ? [...list.visible, id]
                  : list.visible.filter((value) => value !== id)
              )
            }
          >
            {label}
          </Checkbox>
        ))}
      </Menu>
      {selection ? (
        <Checkbox
          isSelected={
            list.rows.length > 0 &&
            list.rows.every((row) => list.selected.includes(row.id))
          }
          onChange={(checked) =>
            list.setSelected(
              checked
                ? [
                    ...new Set([
                      ...list.selected,
                      ...list.rows.map((row) => row.id)
                    ])
                  ]
                : list.selected.filter(
                    (id) => !list.rows.some((row) => row.id === id)
                  )
            )
          }
        >
          {localization.selectAllRows}
        </Checkbox>
      ) : null}
      {list.selected.length ? (
        <Txt>
          {localization.selectedCount.replace(
            "{{count}}",
            String(list.selected.length)
          )}
        </Txt>
      ) : null}
      {children}
    </Box>
  )
}
export function NativeListPagination({
  page,
  lastPage,
  onPage
}: {
  page: number
  lastPage: number
  onPage: (page: number) => void
}) {
  const { localization } = useAuthPlugin(organizationPlugin)
  return (
    <Box className="flex-row items-center gap-3">
      <Button
        variant="secondary"
        isDisabled={page === 0}
        onPress={() => onPage(page - 1)}
      >
        {localization.previousPage}
      </Button>
      <Txt>
        {page + 1} / {lastPage + 1}
      </Txt>
      <Button
        variant="secondary"
        isDisabled={page === lastPage}
        onPress={() => onPage(page + 1)}
      >
        {localization.nextPage}
      </Button>
    </Box>
  )
}
