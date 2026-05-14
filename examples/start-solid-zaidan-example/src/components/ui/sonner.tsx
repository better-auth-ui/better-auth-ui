import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert
} from "lucide-solid"
import {
  type ComponentProps,
  createSignal,
  type JSX,
  onCleanup,
  onMount
} from "solid-js"
import { Toaster as Sonner } from "solid-sonner"

import { readStoredThemePreference, resolveThemePreference } from "@/lib/theme"

type ToasterProps = ComponentProps<typeof Sonner>

const resolveCurrentTheme = (): ToasterProps["theme"] => {
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches

  return resolveThemePreference(readStoredThemePreference(), prefersDark)
}

const Toaster = (props: ToasterProps) => {
  const [theme, setTheme] = createSignal<ToasterProps["theme"]>("system")

  onMount(() => {
    const mediaQuery = matchMedia("(prefers-color-scheme: dark)")
    const syncTheme = () => setTheme(resolveCurrentTheme())

    syncTheme()
    window.addEventListener("storage", syncTheme)
    mediaQuery.addEventListener("change", syncTheme)

    onCleanup(() => {
      window.removeEventListener("storage", syncTheme)
      mediaQuery.removeEventListener("change", syncTheme)
    })
  })

  return (
    <Sonner
      theme={theme()}
      class="toaster group"
      position="top-center"
      icons={{
        success: <CircleCheck class="size-4" />,
        info: <Info class="size-4" />,
        warning: <TriangleAlert class="size-4" />,
        error: <OctagonX class="size-4" />,
        loading: <LoaderCircle class="size-4 animate-spin" />
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)"
        } as JSX.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
