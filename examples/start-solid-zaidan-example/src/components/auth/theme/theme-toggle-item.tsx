import { useAuth } from "@better-auth-ui/solid"
import { Monitor, Moon, PaletteIcon, Sun } from "lucide-solid"
import { createSignal, For, onMount } from "solid-js"
import {
  resolveThemePluginState,
  type ThemeOption
} from "@/components/auth/theme/theme-plugin-state"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { applyThemePreference, isThemeMode, type ThemeMode } from "@/lib/theme"
import { cn } from "cn"

export type ThemeToggleItemProps = {
  class?: string
}

const themeIcon = (value: ThemeMode) => {
  if (value === "light") return Sun
  if (value === "dark") return Moon

  return Monitor
}

const themeLabel = (
  localization: ReturnType<typeof resolveThemePluginState>["localization"],
  option: ThemeOption
) => localization[option.value]

export function ThemeToggleItem(props: ThemeToggleItemProps = {}) {
  const auth = useAuth()
  const themeState = () => resolveThemePluginState(auth.plugins)
  const [theme, setTheme] = createSignal<ThemeMode>(themeState().theme)
  let tabsListElement!: HTMLDivElement

  onMount(() => {
    const initialTheme = themeState().theme

    setTheme(initialTheme)
    applyThemePreference(initialTheme)
  })

  const selectTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme)
    themeState().setTheme(nextTheme)
  }

  const focusActiveTab = () => {
    const activeTab = tabsListElement?.querySelector<HTMLElement>(
      '[role="tab"][data-selected]'
    )

    activeTab?.focus({ preventScroll: true })
  }

  const handleTabsKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return

    const target = event.target as HTMLElement
    if (target.getAttribute("role") !== "tab") return

    const wrapper = target.closest<HTMLElement>('[role="menuitem"]')
    const content = wrapper?.closest<HTMLElement>(
      '[data-slot="dropdown-menu-content"]'
    )
    if (!wrapper || !content) return

    const items = Array.from(
      content.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])'
      )
    )
    const currentIndex = items.indexOf(wrapper)
    const nextIndex =
      event.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1
    const next = items[nextIndex]
    if (!next) return

    event.preventDefault()
    next.focus()
  }

  return (
    <DropdownMenuItem
      class={cn(
        "z-dropdown-menu-item-auth hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-expanded:bg-accent data-expanded:text-accent-foreground",
        props.class
      )}
      closeOnSelect={false}
      onFocus={(event) => {
        if (event.target === event.currentTarget) focusActiveTab()
      }}
    >
      <div class="flex w-full items-center gap-2">
        <PaletteIcon class="size-4 text-muted-foreground" />
        <span>{themeState().localization.theme}</span>

        <Tabs
          class="ml-auto"
          onKeyDown={handleTabsKeyDown}
          onChange={(nextTheme) => {
            if (isThemeMode(nextTheme)) selectTheme(nextTheme)
          }}
          value={theme()}
        >
          <TabsList class="z-tabs-list-theme-toggle" ref={tabsListElement}>
            <For each={themeState().themes}>
              {(option) => {
                const Icon = themeIcon(option.value)

                return (
                  <TabsTrigger
                    aria-label={themeLabel(themeState().localization, option)}
                    class="size-5 p-0"
                    value={option.value}
                  >
                    <Icon class="size-3" />
                  </TabsTrigger>
                )
              }}
            </For>
          </TabsList>
        </Tabs>
      </div>
    </DropdownMenuItem>
  )
}
