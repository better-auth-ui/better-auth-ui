import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useHydrated } from "../../src/hooks/use-hydrated"

describe("useHydrated", () => {
  it("should return true when rendering on client", () => {
    const { result } = renderHook(() => useHydrated())

    expect(result.current).toBe(true)
  })

  it("should return consistent value across renders", () => {
    const { result, rerender } = renderHook(() => useHydrated())

    const firstValue = result.current
    rerender()
    const secondValue = result.current

    expect(firstValue).toBe(secondValue)
    expect(firstValue).toBe(true)
  })

  it("should be stable and not cause re-renders", () => {
    let renderCount = 0
    const { rerender } = renderHook(() => {
      renderCount++
      return useHydrated()
    })

    expect(renderCount).toBe(1)

    rerender()
    expect(renderCount).toBe(2)
  })
})
