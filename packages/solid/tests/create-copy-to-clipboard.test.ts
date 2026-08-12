import { createRoot } from "solid-js"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createCopyToClipboard } from "../src"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("createCopyToClipboard", () => {
  it("shows temporary feedback after a successful copy", async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("navigator", { clipboard: { writeText } })

    await createRoot(async (dispose) => {
      const clipboard = createCopyToClipboard()

      expect(await clipboard.copy("secret")).toBe(true)
      expect(writeText).toHaveBeenCalledWith("secret")
      expect(clipboard.copied()).toBe(true)

      vi.advanceTimersByTime(2000)

      expect(clipboard.copied()).toBe(false)
      dispose()
    })
  })

  it("does not schedule feedback after disposal during a copy", async () => {
    vi.useFakeTimers()
    const deferred = Promise.withResolvers<void>()
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockReturnValue(deferred.promise) }
    })

    const { clipboard, dispose } = createRoot((dispose) => ({
      clipboard: createCopyToClipboard(),
      dispose
    }))
    const copy = clipboard.copy("secret")

    dispose()
    deferred.resolve()

    await expect(copy).resolves.toBe(true)
    expect(clipboard.copied()).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("reports clipboard failures without showing success feedback", async () => {
    const error = new Error("Clipboard unavailable")
    const onError = vi.fn()
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(error) }
    })

    await createRoot(async (dispose) => {
      const clipboard = createCopyToClipboard({ onError })

      expect(await clipboard.copy("secret")).toBe(false)
      expect(onError).toHaveBeenCalledWith(error)
      expect(clipboard.copied()).toBe(false)
      dispose()
    })
  })
})
