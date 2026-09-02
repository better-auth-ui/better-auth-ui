import { describe, expect, it } from "vitest"
import {
  getClampedTablePageIndex,
  getLookaheadPage,
  parseTableColumnVisibility,
  parseTableFilterValue,
  parseTablePage,
  parseTablePageSize,
  parseTableSorting,
  parseTableUrlState,
  serializeTableColumnVisibility,
  serializeTableFilterValue,
  serializeTableUrlState
} from "../src/lib/table-state"

describe("table state", () => {
  it("bounds page numbers and only accepts configured page sizes", () => {
    expect(parseTablePage("3", 1)).toBe(3)
    expect(parseTablePage("10001", 1)).toBe(1)
    expect(parseTablePage("-2", 1)).toBe(1)
    expect(parseTablePageSize("20", 10, [10, 20, 50])).toBe(20)
    expect(parseTablePageSize("5000", 10, [10, 20, 50])).toBe(10)
  })

  it("filters malformed, duplicate, and unknown sorting entries", () => {
    expect(
      parseTableSorting(
        "name.asc,role.sideways,name.desc,createdAt.desc,unknown.asc",
        ["name", "createdAt"]
      )
    ).toEqual([
      { desc: false, id: "name" },
      { desc: true, id: "createdAt" }
    ])
  })

  it("round trips versioned visibility while accepting legacy values", () => {
    const serialized = serializeTableColumnVisibility({ email: false })
    expect(parseTableColumnVisibility(serialized, ["email"])).toEqual({
      email: false
    })
    expect(
      parseTableColumnVisibility('{"email":false,"unknown":true}', ["email"])
    ).toEqual({ email: false })
    expect(parseTableColumnVisibility('{"email":"false"}')).toEqual({})
  })

  it("round trips scalar and multi-value filters without changing legacy strings", () => {
    expect(parseTableFilterValue("admin")).toBe("admin")
    expect(
      parseTableFilterValue(serializeTableFilterValue(["admin", "owner"]) ?? "")
    ).toEqual(["admin", "owner"])
    expect(parseTableFilterValue(serializeTableFilterValue(7) ?? "")).toBe(7)
    expect(parseTableFilterValue(serializeTableFilterValue("~7") ?? "")).toBe(
      "~7"
    )
    expect(serializeTableFilterValue({ role: "admin" })).toBeUndefined()
    expect(parseTableFilterValue("~not-json")).toBe("~not-json")
  })

  it("splits a lookahead response into visible rows and next-page state", () => {
    expect(getLookaheadPage([1, 2, 3], 2)).toEqual({
      hasNextPage: true,
      rows: [1, 2]
    })
    expect(getLookaheadPage([1, 2], 2)).toEqual({
      hasNextPage: false,
      rows: [1, 2]
    })
  })

  it("clamps pagination after the result count shrinks", () => {
    expect(getClampedTablePageIndex(2, 10, 35)).toBe(2)
    expect(getClampedTablePageIndex(3, 10, 21)).toBe(2)
    expect(getClampedTablePageIndex(1, 10, 0)).toBe(0)
    expect(getClampedTablePageIndex(-2, 0, -1)).toBe(0)
  })

  it("uses finite pagination defaults for non-finite inputs", () => {
    expect(getClampedTablePageIndex(Number.NaN, 10, 35)).toBe(0)
    expect(getClampedTablePageIndex(2, Number.POSITIVE_INFINITY, 35)).toBe(2)
    expect(getClampedTablePageIndex(2, 10, Number.NEGATIVE_INFINITY)).toBe(0)
    expect(
      Number.isFinite(
        getClampedTablePageIndex(
          Number.POSITIVE_INFINITY,
          Number.NaN,
          Number.POSITIVE_INFINITY
        )
      )
    ).toBe(true)
  })

  it("round trips namespaced URL state without changing unrelated parameters", () => {
    const params = serializeTableUrlState(
      new URLSearchParams("other=kept&members.filter.stale=value"),
      "members",
      10,
      {
        columnFilters: [{ id: "role", value: ["admin", "owner"] }],
        globalFilter: "Ada",
        pagination: { pageIndex: 2, pageSize: 20 },
        sorting: [
          { desc: false, id: "name" },
          { desc: true, id: "createdAt" }
        ]
      }
    )

    expect(params.get("other")).toBe("kept")
    expect(params.has("members.filter.stale")).toBe(false)
    expect(
      parseTableUrlState(
        params,
        "members",
        10,
        [10, 20, 50],
        ["role", "name", "createdAt"]
      )
    ).toEqual({
      columnFilters: [{ id: "role", value: ["admin", "owner"] }],
      globalFilter: "Ada",
      pagination: { pageIndex: 2, pageSize: 20 },
      sorting: [
        { desc: false, id: "name" },
        { desc: true, id: "createdAt" }
      ]
    })
  })
})
