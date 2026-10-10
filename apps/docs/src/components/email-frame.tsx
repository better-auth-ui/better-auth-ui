import { useTheme } from "fumadocs-ui/provider/base"
import { useEffect, useMemo, useState } from "react"
import { cn } from "cn"

interface EmailFrameProps {
  title: string
  srcDoc: string
  className?: string
}

/**
 * Finds `@media (prefers-color-scheme: dark) { ... }` blocks in the email HTML
 * and either unwraps them (dark mode) or removes them (light mode) so the email
 * doesn't depend on the iframe's `prefers-color-scheme` — which Safari refuses
 * to derive from the host's `color-scheme` the way Chrome does.
 */
function applyThemeToSrcDoc(srcDoc: string, isDark: boolean): string {
  const marker = "@media (prefers-color-scheme: dark)"
  let result = ""
  let cursor = 0

  while (cursor < srcDoc.length) {
    const start = srcDoc.indexOf(marker, cursor)
    if (start === -1) {
      result += srcDoc.slice(cursor)
      break
    }

    const openBrace = srcDoc.indexOf("{", start + marker.length)
    if (openBrace === -1) {
      result += srcDoc.slice(cursor)
      break
    }

    let depth = 1
    let i = openBrace + 1
    while (i < srcDoc.length && depth > 0) {
      const ch = srcDoc[i]
      if (ch === "{") depth++
      else if (ch === "}") depth--
      i++
    }

    result += srcDoc.slice(cursor, start)
    if (isDark) {
      result += srcDoc.slice(openBrace + 1, i - 1)
    }
    cursor = i
  }

  return result
}

export function EmailFrame({ title, srcDoc, className }: EmailFrameProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setMounted(true)

    setTimeout(() => {
      setVisible(true)
    }, 100)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const themedSrcDoc = useMemo(
    () => applyThemeToSrcDoc(srcDoc, isDark),
    [srcDoc, isDark]
  )

  return (
    <iframe
      title={title}
      srcDoc={themedSrcDoc}
      loading="eager"
      className={cn(
        "w-full rounded-xl border-0 transition-opacity",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        backgroundColor: "transparent",
        colorScheme: isDark ? "dark" : "light"
      }}
    />
  )
}
