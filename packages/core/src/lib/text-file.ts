const TEXT_FILE_TYPE = "text/plain;charset=utf-8"
const PRINT_FRAME_CLEANUP_DELAY = 60_000

function createTextFileUrl(text: string) {
  return URL.createObjectURL(new Blob([text], { type: TEXT_FILE_TYPE }))
}

/**
 * Download plain text as a `.txt` file generated in the browser.
 *
 * @param text - Exact text content to save.
 * @param filename - Suggested download filename.
 */
export function downloadTextFile(text: string, filename: `${string}.txt`) {
  const url = createTextFileUrl(text)
  const link = document.createElement("a")

  link.download = filename
  link.href = url
  link.hidden = true
  document.body.append(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * Print plain text in an isolated, hidden frame.
 *
 * Loading a `text/plain` Blob keeps the print document limited to the exact
 * file contents instead of printing the surrounding application UI.
 *
 * @param text - Exact text content to print.
 */
export function printTextFile(text: string) {
  const url = createTextFileUrl(text)
  const frame = document.createElement("iframe")
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = document.documentElement.clientHeight
  let cleanupTimeout: ReturnType<typeof setTimeout> | null = null
  let removed = false

  const cleanup = () => {
    if (removed) return

    removed = true
    if (cleanupTimeout !== null) clearTimeout(cleanupTimeout)
    frame.remove()
    URL.revokeObjectURL(url)
  }

  frame.ariaHidden = "true"
  frame.title = "Print text file"
  frame.width = `${viewportWidth}px`
  frame.height = `${viewportHeight}px`
  frame.style.position = "absolute"
  frame.style.top = `-${viewportHeight + 100}px`
  frame.style.left = `-${viewportWidth + 100}px`
  frame.style.border = "0"

  frame.addEventListener(
    "load",
    () => {
      const printWindow = frame.contentWindow

      if (!printWindow) {
        cleanup()
        return
      }

      printWindow.addEventListener("afterprint", cleanup, { once: true })
      cleanupTimeout = setTimeout(cleanup, PRINT_FRAME_CLEANUP_DELAY)

      try {
        printWindow.focus()
        printWindow.print()
      } catch {
        cleanup()
      }
    },
    { once: true }
  )
  frame.addEventListener("error", cleanup, { once: true })
  frame.src = url
  document.body.append(frame)
}
