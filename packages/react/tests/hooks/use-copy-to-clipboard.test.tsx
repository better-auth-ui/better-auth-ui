import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useCopyToClipboard } from "../../src"

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("useCopyToClipboard", () => {
  it("shows temporary feedback after a successful copy", async () => {
    vi.useFakeTimers()
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue()
    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      expect(await result.current.copy("secret")).toBe(true)
    })

    expect(writeText).toHaveBeenCalledWith("secret")
    expect(result.current.copied).toBe(true)

    act(() => vi.advanceTimersByTime(2000))

    expect(result.current.copied).toBe(false)
  })

  it("does not schedule feedback after unmounting during a copy", async () => {
    vi.useFakeTimers()
    const deferred = Promise.withResolvers<void>()
    vi.spyOn(navigator.clipboard, "writeText").mockReturnValue(deferred.promise)
    const { result, unmount } = renderHook(() => useCopyToClipboard())
    const copy = result.current.copy("secret")

    unmount()
    deferred.resolve()

    await expect(copy).resolves.toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("reports clipboard failures without showing success feedback", async () => {
    const error = new Error("Clipboard unavailable")
    const onError = vi.fn()
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(error)
    const { result } = renderHook(() => useCopyToClipboard({ onError }))

    await act(async () => {
      expect(await result.current.copy("secret")).toBe(false)
    })

    expect(onError).toHaveBeenCalledWith(error)
    expect(result.current.copied).toBe(false)
  })
})
