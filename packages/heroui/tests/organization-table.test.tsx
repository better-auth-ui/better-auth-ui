import type { TablePersistenceAdapters } from "@better-auth-ui/core"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  createOrganizationColumnHelper,
  useOrganizationTable
} from "../src/components/auth/organization/organization-table"
import { OrganizationTableRenderer } from "../src/components/auth/organization/organization-table-renderer"
import { OrganizationTableSelectRow } from "../src/components/auth/organization/organization-table-selection"
import { useOrganizationTableState } from "../src/components/auth/organization/organization-table-state"

type TestRow = {
  group: string
  id: string
  name: string
}

const columnHelper = createOrganizationColumnHelper<TestRow>()
const columns = columnHelper.columns([
  columnHelper.accessor("group", {
    cell: ({ getValue }) => getValue(),
    filterFn: "includesString",
    header: "Group"
  }),
  columnHelper.accessor("name", {
    cell: ({ getValue }) => getValue(),
    filterFn: "includesString",
    header: "Name"
  })
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
  it("renders header groups and visible cells through column renderers", () => {
    function TableFixture() {
      const table = useOrganizationTable({
        columns,
        data: rows.slice(0, 1),
        getRowId: (row) => row.id
      })

      return (
        <table.AppTable>
          <OrganizationTableRenderer ariaLabel="People" empty="No people" />
        </table.AppTable>
      )
    }

    render(<TableFixture />)

    expect(screen.getByRole("columnheader", { name: "Group" })).toBeVisible()
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeVisible()
    expect(screen.getByRole("gridcell", { name: "Ada" })).toBeVisible()
  })

  it("preserves Shift for keyboard range selection", () => {
    const toggleSelected = vi.fn()
    const { result } = renderHook(() =>
      useOrganizationTable({
        columns,
        data: rows,
        getRowId: (row) => row.id
      })
    )
    const row = result.current.getRow("1")
    vi.spyOn(row, "getToggleSelectedHandler").mockReturnValue(toggleSelected)

    render(
      <OrganizationTableSelectRow
        localization={organizationLocalization}
        row={row}
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

  it("renders TanStack multi-sort state through HeroUI columns", async () => {
    const user = userEvent.setup()
    const sortableColumns = columnHelper.columns([
      columnHelper.accessor("group", {
        cell: ({ getValue }) => getValue(),
        header: "Group"
      }),
      columnHelper.accessor("name", {
        cell: ({ getValue }) => getValue(),
        header: "Name"
      })
    ])

    function TableFixture() {
      const table = useOrganizationTable({
        columns: sortableColumns,
        data: rows,
        getRowId: (row) => row.id,
        initialState: {
          sorting: [
            { desc: false, id: "group" },
            { desc: false, id: "name" }
          ]
        }
      })

      return (
        <table.AppTable>
          <OrganizationTableRenderer ariaLabel="People" empty="No people" />
        </table.AppTable>
      )
    }

    render(<TableFixture />)

    expect(screen.getByRole("columnheader", { name: /Group/ })).toHaveAttribute(
      "aria-sort",
      "ascending"
    )
    expect(
      screen.getByRole("columnheader", { name: /Group/ })
    ).toHaveTextContent("1")
    expect(
      screen.getByRole("columnheader", { name: /Name/ })
    ).toHaveTextContent("2")

    await user.click(screen.getByRole("columnheader", { name: /Group/ }))
    await waitFor(() =>
      expect(
        screen.getByRole("columnheader", { name: /Group/ })
      ).toHaveAttribute("aria-sort", "descending")
    )
    expect(
      screen.getByRole("columnheader", { name: /Name/ })
    ).toHaveTextContent("2")
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

  it("restores state when a router adapter reports navigation", async () => {
    let params = new URLSearchParams("router.search=first")
    let notifyNavigation = () => undefined
    const adapters: TablePersistenceAdapters = {
      search: {
        read: () => new URLSearchParams(params),
        replace: (next) => {
          params = new URLSearchParams(next)
        },
        subscribe: (listener) => {
          notifyNavigation = listener
          return () => {
            notifyNavigation = () => undefined
          }
        }
      }
    }
    const { result } = renderHook(() =>
      useOrganizationTableState("router", 10, TEST_COLUMN_IDS, adapters)
    )

    await waitFor(() => expect(result.current.ready).toBe(true))
    expect(result.current.globalFilter).toBe("first")

    params = new URLSearchParams(
      "router.search=restored&router.sort=name.desc&router.page=2"
    )
    act(() => notifyNavigation())

    await waitFor(() => {
      expect(result.current.globalFilter).toBe("restored")
      expect(result.current.sorting).toEqual([{ desc: true, id: "name" }])
      expect(result.current.pagination.pageIndex).toBe(1)
    })
  })

  it("bounds URL replacements when the adapter notifies synchronously", async () => {
    let params = new URLSearchParams("router.search=first")
    let replacements = 0
    const listeners = new Set<() => void>()
    const adapters: TablePersistenceAdapters = {
      search: {
        read: () => new URLSearchParams(params),
        replace: (next) => {
          replacements += 1
          params = new URLSearchParams(next)
          for (const listener of listeners) listener()
        },
        subscribe: (listener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        }
      }
    }
    const { result } = renderHook(() =>
      useOrganizationTableState("router", 10, TEST_COLUMN_IDS, adapters)
    )

    await waitFor(() => expect(result.current.ready).toBe(true))
    act(() => result.current.setGlobalFilter("local"))

    await waitFor(() => expect(params.get("router.search")).toBe("local"))
    expect(replacements).toBe(1)
  })

  it("restores before writing when the adapter and state key change", async () => {
    let firstParams = new URLSearchParams("first.search=alpha")
    let secondParams = new URLSearchParams("second.search=beta")
    let secondReplacements = 0
    const firstAdapters: TablePersistenceAdapters = {
      search: {
        read: () => new URLSearchParams(firstParams),
        replace: (next) => {
          firstParams = new URLSearchParams(next)
        },
        subscribe: () => () => {}
      }
    }
    const secondAdapters: TablePersistenceAdapters = {
      search: {
        read: () => new URLSearchParams(secondParams),
        replace: (next) => {
          secondReplacements += 1
          secondParams = new URLSearchParams(next)
        },
        subscribe: () => () => {}
      }
    }
    const { result, rerender } = renderHook(
      ({ adapters, stateKey }) =>
        useOrganizationTableState(stateKey, 10, TEST_COLUMN_IDS, adapters),
      {
        initialProps: { adapters: firstAdapters, stateKey: "first" }
      }
    )

    await waitFor(() => {
      expect(result.current.ready).toBe(true)
      expect(result.current.globalFilter).toBe("alpha")
    })

    rerender({ adapters: secondAdapters, stateKey: "second" })

    await waitFor(() => {
      expect(result.current.ready).toBe(true)
      expect(result.current.globalFilter).toBe("beta")
    })
    expect(secondReplacements).toBe(0)
    expect(secondParams.get("second.search")).toBe("beta")
  })
})
