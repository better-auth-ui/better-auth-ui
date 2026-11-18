import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi
} from "vitest"

import { downloadTextFile, printTextFile } from "../src/lib/text-file"

class MockElement extends EventTarget {
  ariaHidden = ""
  download = ""
  hidden = false
  height = ""
  href = ""
  src = ""
  style: Record<string, string> = {}
  title = ""
  width = ""
  click = vi.fn<(...args: unknown[]) => unknown>()
  remove = vi.fn<(...args: unknown[]) => unknown>()
}

class MockPrintWindow extends EventTarget {
  focus = vi.fn<(...args: unknown[]) => unknown>()
  print = vi.fn<(...args: unknown[]) => unknown>()
}

describe("text file browser actions", () => {
  let appendedElement: MockElement | null
  let createdBlob: Blob | null
  let printWindow: MockPrintWindow
  let revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>

  beforeEach(() => {
    appendedElement = null
    createdBlob = null
    printWindow = new MockPrintWindow()

    vi.stubGlobal("document", {
      body: {
        appendChild: vi.fn<(element: MockElement) => MockElement>(
          (element: MockElement) => {
            appendedElement = element
            return element
          }
        )
      },
      documentElement: {
        clientHeight: 768,
        clientWidth: 1024
      },
      createElement: vi.fn<(tagName: string) => MockElement>(
        (tagName: string) => {
          const element = new MockElement()

          if (tagName === "iframe") {
            Object.assign(element, { contentWindow: printWindow })
          }

          return element
        }
      )
    })
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      createdBlob = blob as Blob
      return "blob:text-file"
    })
    revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("downloads the exact plain-text contents with the requested filename", async () => {
    vi.useFakeTimers()

    try {
      downloadTextFile("code-1\ncode-2", "backup-codes.txt")

      expect(appendedElement).toMatchObject({
        download: "backup-codes.txt",
        href: "blob:text-file"
      })
      expect(appendedElement?.click).toHaveBeenCalledOnce()
      expect(createdBlob?.type).toBe("text/plain;charset=utf-8")
      await expect(createdBlob?.text()).resolves.toBe("code-1\ncode-2")

      await vi.runAllTimersAsync()
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:text-file")
    } finally {
      vi.useRealTimers()
    }
  })

  it("prints only the exact plain-text file in an isolated frame", async () => {
    printTextFile("code-1\ncode-2")

    expect(appendedElement?.src).toBe("blob:text-file")
    expect(appendedElement).toMatchObject({
      height: "768px",
      width: "1024px"
    })
    expect(createdBlob?.type).toBe("text/plain;charset=utf-8")
    await expect(createdBlob?.text()).resolves.toBe("code-1\ncode-2")

    appendedElement?.dispatchEvent(new Event("load"))

    expect(printWindow.focus).toHaveBeenCalledOnce()
    expect(printWindow.print).toHaveBeenCalledOnce()

    printWindow.dispatchEvent(new Event("afterprint"))

    expect(appendedElement?.remove).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:text-file")
  })
})
