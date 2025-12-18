import { cn } from "fumadocs-ui/utils/cn"
import { useEffect, useRef, useState } from "react"

interface DemoIframeProps {
  src: string
  className?: string
  title?: string
}

/**
 * Renders an iframe that fades in after its content finishes loading.
 *
 * @param src - URL to load in the iframe
 * @param className - Additional class names applied to the iframe element
 * @param title - Accessible title for the iframe; defaults to "Demo"
 * @returns A React element containing a bordered wrapper and an iframe that transitions to full opacity once its content has loaded
 */
export function DemoIframe({
  src,
  className,
  title = "Demo"
}: DemoIframeProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setTimeout(() => {
        setIsLoaded(true)
      }, 150)
    }

    try {
      if (iframe.contentDocument?.readyState === "complete") {
        handleLoad()
        return
      }
    } catch {}

    iframe.addEventListener("load", handleLoad)

    return () => {
      setIsLoaded(false)
      iframe.removeEventListener("load", handleLoad)
    }
  }, [])

  return (
    <div className="border rounded-xl">
      <iframe
        ref={iframeRef}
        title={title}
        src={src}
        className={cn(
          "w-full rounded-xl bg-transparent transition-all",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  )
}
