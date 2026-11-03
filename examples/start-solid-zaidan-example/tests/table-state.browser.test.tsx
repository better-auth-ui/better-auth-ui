import { createRoot } from "solid-js"
import { expect, it } from "vitest"
import { createServerTableState } from "../src/components/auth/server-table-state"

it("keeps page navigation independent of filter reset subscriptions", () => {
  createRoot((dispose) => {
    try {
      const state = createServerTableState({ pageSize: 10 })
      state.atoms.globalFilter.set("Ada")
      state.setPagination((current) => ({ ...current, pageIndex: 2 }))
      expect(state.pagination().pageIndex).toBe(2)
      state.atoms.sorting.set([{ id: "name", desc: false }])
      expect(state.pagination().pageIndex).toBe(0)
      state.setPagination((current) => ({ ...current, pageIndex: 1 }))
      expect(state.pagination().pageIndex).toBe(1)
      state.atoms.columnFilters.set([{ id: "status", value: "active" }])
      expect(state.pagination().pageIndex).toBe(0)
    } finally {
      dispose()
    }
  })
})
