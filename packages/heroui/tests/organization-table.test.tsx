import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  createOrganizationColumnHelper,
  useOrganizationTable
} from "../src/components/auth/organization/organization-table"

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

describe("organization table state", () => {
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
})
