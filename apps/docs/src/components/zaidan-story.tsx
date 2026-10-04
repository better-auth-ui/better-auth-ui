"use client"

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  useCallback,
  useEffect,
  useRef
} from "react"

import { cn } from "cn"

export type ZaidanStoryProps = Omit<
  ComponentPropsWithoutRef<"iframe">,
  "height" | "src" | "title"
> & {
  /** Storybook story id, for example `zaidan-infrastructure-storybook--placeholder`. */
  storyId: string
  /** Accessible iframe title. Defaults to the story id. */
  title?: string
  /** Embed height. Defaults to `520`. */
  height?: number | string
  /** Hosted Storybook base path. Defaults to `/storybook/zaidan`. */
  basePath?: string
  /** Optional class name for the outer preview frame. */
  containerClassName?: string
}

const DEFAULT_BASE_PATH = "/storybook/zaidan"
const DEFAULT_HEIGHT = 520

function normalizeBasePath(basePath: string) {
  return basePath.replace(/\/+$/, "")
}

export function ZaidanStory({
  storyId,
  title,
  height = DEFAULT_HEIGHT,
  basePath = DEFAULT_BASE_PATH,
  className,
  containerClassName,
  loading = "lazy",
  onLoad,
  ...props
}: ZaidanStoryProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const normalizedBasePath = normalizeBasePath(basePath)
  const src = `${normalizedBasePath}/iframe?id=${encodeURIComponent(
    storyId
  )}&viewMode=story`
  const style = {
    "--zaidan-story-height": formatHeight(height)
  } as CSSProperties

  const syncTheme = useCallback(() => {
    try {
      const iframeDocument = iframeRef.current?.contentDocument

      if (!iframeDocument) return

      const dark = document.documentElement.classList.contains("dark")
      const root = iframeDocument.documentElement

      root.classList.toggle("dark", dark)
      root.setAttribute("data-theme", dark ? "dark" : "light")
    } catch {
      // Cross-origin embeds cannot be themed by mutating the iframe document.
    }
  }, [])

  useEffect(() => {
    syncTheme()

    const observer = new MutationObserver(syncTheme)

    observer.observe(document.documentElement, {
      attributeFilter: ["class", "data-theme"],
      attributes: true
    })

    return () => observer.disconnect()
  }, [syncTheme])

  return (
    <div
      className={cn(
        "not-prose my-4 w-full overflow-hidden rounded-xl border border-separator bg-background",
        containerClassName
      )}
      style={style}
    >
      <iframe
        allow="clipboard-write"
        className={cn(
          "block h-[var(--zaidan-story-height)] w-full border-0",
          className
        )}
        loading={loading}
        onLoad={(event) => {
          syncTheme()
          window.setTimeout(syncTheme, 0)
          window.setTimeout(syncTheme, 100)
          window.setTimeout(syncTheme, 500)
          onLoad?.(event)
        }}
        ref={iframeRef}
        src={src}
        title={title ?? `Zaidan story: ${storyId}`}
        {...props}
      />
    </div>
  )
}

function formatHeight(height: number | string) {
  return typeof height === "number" ? `${height}px` : height
}
