import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { useServerTableState } from "../src/components/auth/server-table-state"
afterEach(cleanup)
it("keeps page navigation independent of filter reset subscriptions", () => {
  const { result } = renderHook(() => useServerTableState({ pageSize: 10 }))
  act(() => {
    result.current.atoms.globalFilter.set("Ada")
  })
  act(() => {
    result.current.setPagination((current) => ({ ...current, pageIndex: 2 }))
  })
  expect(result.current.pagination.pageIndex).toBe(2)
  act(() => {
    result.current.atoms.sorting.set([{ id: "name", desc: false }])
  })
  expect(result.current.pagination.pageIndex).toBe(0)
  act(() => {
    result.current.setPagination((current) => ({ ...current, pageIndex: 1 }))
  })
  expect(result.current.pagination.pageIndex).toBe(1)
  act(() => {
    result.current.atoms.columnFilters.set([{ id: "status", value: "active" }])
  })
  expect(result.current.pagination.pageIndex).toBe(0)
})
