import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useHydrated } from "../../src/hooks/use-hydrated"

describe("useHydrated", () => {
  it("should return true when running on client-side", () => {
    const { result } = renderHook(() => useHydrated())

    expect(result.current).toBe(true)
  })

  it("should be consistent across re-renders", () => {
    const { result, rerender } = renderHook(() => useHydrated())

    const firstValue = result.current
    rerender()

    expect(result.current).toBe(firstValue)
    expect(result.current).toBe(true)
  })

  it("should use useSyncExternalStore correctly", () => {
    // Test that the hook doesn't throw and returns expected value
    const { result } = renderHook(() => useHydrated())

    expect(typeof result.current).toBe("boolean")
    expect(result.current).toBe(true)
  })

  it("should not cause re-renders when called multiple times", () => {
    let renderCount = 0
    
    const { rerender } = renderHook(() => {
      renderCount++
      return useHydrated()
    })

    const initialRenderCount = renderCount
    rerender()
    
    // Should only increment by 1 for the rerender, not multiple times
    expect(renderCount).toBe(initialRenderCount + 1)
  })

  it("should work in multiple hook instances simultaneously", () => {
    const { result: result1 } = renderHook(() => useHydrated())
    const { result: result2 } = renderHook(() => useHydrated())

    expect(result1.current).toBe(true)
    expect(result2.current).toBe(true)
    expect(result1.current).toBe(result2.current)
  })
})