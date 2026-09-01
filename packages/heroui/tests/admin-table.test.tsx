import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  createAdminColumnHelper,
  useAdminTable
} from "../src/components/auth/admin/admin-table"

type TestUser = {
  banned: boolean
  id: string
  name: string
}

const columnHelper = createAdminColumnHelper<TestUser>()
const columns = columnHelper.columns([
  columnHelper.accessor("name", { id: "name" }),
  columnHelper.accessor("banned", {
    id: "status",
    enableSorting: false
  })
])
const rows: TestUser[] = [
  { banned: false, id: "2", name: "Bea" },
  { banned: true, id: "3", name: "Charlie" }
]

describe("admin table state", () => {
  it("keeps server rows intact while managing table controls", () => {
    const { result } = renderHook(() =>
      useAdminTable({
        columns,
        data: rows,
        getRowId: (row) => row.id,
        initialState: {
          pagination: { pageIndex: 1, pageSize: 2 }
        },
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        rowCount: 5
      })
    )

    expect(
      result.current.getRowModel().rows.map((row) => row.original.id)
    ).toEqual(["2", "3"])
    expect(result.current.getPageCount()).toBe(3)
    expect(result.current.getCanPreviousPage()).toBe(true)
    expect(result.current.getCanNextPage()).toBe(true)

    act(() => result.current.getColumn("name")?.toggleSorting(false))
    act(() => result.current.getColumn("status")?.setFilterValue("banned"))
    act(() => result.current.setGlobalFilter("charlie"))

    expect(result.current.state.sorting).toEqual([{ desc: false, id: "name" }])
    expect(result.current.state.columnFilters).toEqual([
      { id: "status", value: "banned" }
    ])
    expect(result.current.state.globalFilter).toBe("charlie")
  })
})
