import { createSignal, onCleanup } from "solid-js"

export type CreateCopyToClipboardOptions = {
  /** How long the copied state remains active. @default 2000 */
  feedbackDuration?: number
  /** Called when the Clipboard API rejects or is unavailable. */
  onError?: (error: unknown) => void
}

/** Copies text and exposes temporary success state for inline feedback. */
export function createCopyToClipboard({
  feedbackDuration = 2000,
  onError
}: CreateCopyToClipboardOptions = {}) {
  const [copied, setCopied] = createSignal(false)
  let disposed = false
  let resetTimeout: ReturnType<typeof setTimeout> | undefined

  const clearResetTimeout = () => {
    if (resetTimeout !== undefined) {
      clearTimeout(resetTimeout)
      resetTimeout = undefined
    }
  }

  const reset = () => {
    clearResetTimeout()
    setCopied(false)
  }

  onCleanup(() => {
    disposed = true
    clearResetTimeout()
  })

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch (error) {
      onError?.(error)
      return false
    }

    if (disposed) return true

    clearResetTimeout()
    setCopied(true)
    resetTimeout = setTimeout(() => {
      setCopied(false)
      resetTimeout = undefined
    }, feedbackDuration)

    return true
  }

  return { copied, copy, reset }
}
