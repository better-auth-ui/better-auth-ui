import { describe, expect, it } from "vitest"
import {
  getHeroUISelection,
  getHeroUISortDescriptor,
  getTanStackRowSelection,
  getTanStackSorting
} from "../src/components/auth/table-bridge"

describe("HeroUI table bridge", () => {
  it("round trips the primary sort descriptor", () => {
    const sorting = [{ desc: true, id: "createdAt" }]
    const descriptor = getHeroUISortDescriptor(sorting)

    expect(descriptor).toEqual({
      column: "createdAt",
      direction: "descending"
    })
    if (!descriptor) {
      throw new Error("Expected a HeroUI sort descriptor")
    }
    expect(getTanStackSorting(descriptor)).toEqual(sorting)
  })

  it("honors HeroUI direction changes without dropping secondary sorts", () => {
    expect(
      getTanStackSorting({ column: "name", direction: "descending" }, [
        { id: "createdAt", desc: true },
        { id: "name", desc: false }
      ])
    ).toEqual([
      { id: "name", desc: true },
      { id: "createdAt", desc: true }
    ])
  })

  it("converts explicit and all-row selection", () => {
    expect(getHeroUISelection({ first: true, ignored: false })).toEqual(
      new Set(["first"])
    )
    expect(
      getTanStackRowSelection(new Set(["second"]), ["first", "second"])
    ).toEqual({ second: true })
    expect(getTanStackRowSelection("all", ["first", "second"])).toEqual({
      first: true,
      second: true
    })
  })
})
