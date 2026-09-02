import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createOrganizationColumnHelper,
  useOrganizationTable
} from "../src/components/auth/organization/organization-table"
import { OrganizationTableSelectRow } from "../src/components/auth/organization/organization-table-selection"
import { useOrganizationTableState } from "../src/components/auth/organization/organization-table-state"

type TestRow = {
  group: string
  id: string
  name: string
}

const columnHelper = createOrganizationColumnHelper<TestRow>()
const columns = columnHelper.columns([
  columnHelper.accessor("group", { filterFn: "includesString" }),
  columnHelper.accessor("name", { filterFn: "includesString" })
])
const rows: TestRow[] = [
  { group: "b", id: "1", name: "Ada" },
  { group: "a", id: "2", name: "Charlie" },
  { group: "a", id: "3", name: "Bea" }
]
const TEST_COLUMN_IDS = ["group", "name"] as const

afterEach(() => {
  window.history.replaceState({}, "", "/")
  window.localStorage.clear()
})

describe("organization table state", () => {
  it("preserves Shift for keyboard range selection", () => {
    const toggleSelected = vi.fn()
    render(
      <OrganizationTableSelectRow
        localization={organizationLocalization}
        row={{
          getCanSelect: () => true,
          getIsSelected: () => false,
          getToggleSelectedHandler: () => toggleSelected
        }}
      />
    )

    const checkbox = screen.getByRole("checkbox", { name: "Select row" })
    fireEvent.keyDown(checkbox, { key: " ", shiftKey: true })
    fireEvent.click(checkbox)

    expect(toggleSelected).toHaveBeenCalledWith({
      shiftKey: true,
      target: { checked: true }
    })
  })

  it("keeps an ordered multi-column sort", () => {
    const { result } = renderHook(() =>
      useOrganizationTable({
        columns,
        data: rows,
        getRowId: (row) => row.id
      })
    )

    act(() => result.current.getColumn("group")?.toggleSorting(false))
    act(() => result.current.getColumn("name")?.toggleSorting(false, true))

    expect(result.current.state.sorting).toEqual([
      { desc: false, id: "group" },
      { desc: false, id: "name" }
    ])
    expect(
      result.current.getRowModel().rows.map((row) => row.original.id)
    ).toEqual(["3", "2", "1"])
  })

  it("paginates client data but leaves server pages intact", () => {
    const client = renderHook(() =>
      useOrganizationTable({
        columns,
        data: rows,
        getRowId: (row) => row.id,
        initialState: { pagination: { pageIndex: 0, pageSize: 2 } }
      })
    )

    expect(
      client.result.current.getRowModel().rows.map((row) => row.original.id)
    ).toEqual(["1", "2"])

    act(() => client.result.current.nextPage())

    expect(
      client.result.current.getRowModel().rows.map((row) => row.original.id)
    ).toEqual(["3"])

    const server = renderHook(() =>
      useOrganizationTable({
        columns,
        data: rows.slice(1),
        getRowId: (row) => row.id,
        initialState: { pagination: { pageIndex: 1, pageSize: 2 } },
        manualPagination: true,
        rowCount: 5
      })
    )

    expect(
      server.result.current.getRowModel().rows.map((row) => row.original.id)
    ).toEqual(["2", "3"])
    expect(server.result.current.getPageCount()).toBe(3)
    expect(server.result.current.getCanPreviousPage()).toBe(true)
    expect(server.result.current.getCanNextPage()).toBe(true)
  })

  it("composes filtering, visibility, and selection state", () => {
    const { result } = renderHook(() =>
      useOrganizationTable({
        columns,
        data: rows,
        getRowId: (row) => row.id,
        globalFilterFn: "includesString"
      })
    )

    act(() => result.current.setGlobalFilter("a"))
    expect(
      result.current.getRowModel().rows.map((row) => row.original.id)
    ).toEqual(["1", "2", "3"])

    act(() => result.current.getColumn("group")?.setFilterValue("a"))
    expect(
      result.current.getRowModel().rows.map((row) => row.original.id)
    ).toEqual(["2", "3"])

    act(() => result.current.getColumn("group")?.toggleVisibility(false))
    expect(
      result.current.getVisibleLeafColumns().map((column) => column.id)
    ).toEqual(["name"])

    act(() => result.current.toggleAllPageRowsSelected(true))
    expect(
      result.current.getSelectedRowModel().rows.map((row) => row.id)
    ).toEqual(["2", "3"])
  })

  it("shares URL-owned state with the table through external atoms", async () => {
    window.history.replaceState(
      {},
      "",
      "/?test.sort=unknown.asc,name.desc&test.filter.group=a"
    )

    const { result } = renderHook(() => {
      const state = useOrganizationTableState("test", 10, TEST_COLUMN_IDS)
      const table = useOrganizationTable({
        atoms: state.atoms,
        columns,
        data: rows,
        getRowId: (row) => row.id,
        state: { columnVisibility: state.columnVisibility },
        onColumnVisibilityChange: state.setColumnVisibility
      })
      return { state, table }
    })

    await waitFor(() => expect(result.current.state.ready).toBe(true))
    expect(result.current.state.sorting).toEqual([{ desc: true, id: "name" }])
    expect(result.current.state.columnFilters).toEqual([
      { id: "group", value: "a" }
    ])
    expect(result.current.table.getRowModel().rows[0]?.original.id).toBe("2")

    act(() => {
      result.current.state.setPagination({ pageIndex: 2, pageSize: 10 })
      result.current.table.getRow("1").toggleSelected(true)
    })
    act(() => result.current.table.setGlobalFilter("Ada"))

    expect(result.current.state.pagination.pageIndex).toBe(0)
    expect(result.current.state.rowSelection).toEqual({})

    await waitFor(() => {
      expect(
        new URL(window.location.href).searchParams.get("test.search")
      ).toBe("Ada")
    })
  })
})
