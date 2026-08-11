import { useCallback, useEffect, useRef, useState } from "react"

export type UseCopyToClipboardOptions = {
  /** How long the copied state remains active. @default 2000 */
  feedbackDuration?: number
  /** Called when the Clipboard API rejects or is unavailable. */
  onError?: (error: unknown) => void
}

/** Copies text and exposes temporary success state for inline feedback. */
export function useCopyToClipboard({
  feedbackDuration = 2000,
  onError
}: UseCopyToClipboardOptions = {}) {
  const [copied, setCopied] = useState(false)
  const disposedRef = useRef(false)
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clearResetTimeout()
    setCopied(false)
  }, [clearResetTimeout])

  useEffect(() => {
    disposedRef.current = false

    return () => {
      disposedRef.current = true
      clearResetTimeout()
    }
  }, [clearResetTimeout])

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value)
      } catch (error) {
        onError?.(error)
        return false
      }

      if (disposedRef.current) return true

      clearResetTimeout()
      setCopied(true)
      resetTimeoutRef.current = setTimeout(() => {
        setCopied(false)
        resetTimeoutRef.current = null
      }, feedbackDuration)

      return true
    },
    [clearResetTimeout, feedbackDuration, onError]
  )

  return { copied, copy, reset }
}
