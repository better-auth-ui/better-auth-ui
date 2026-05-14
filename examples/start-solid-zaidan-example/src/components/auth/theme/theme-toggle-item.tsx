import { Monitor, Moon, PaletteIcon, Sun } from "lucide-solid"
import { createSignal, onMount } from "solid-js"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  applyThemePreference,
  isThemeMode,
  readStoredThemePreference,
  saveThemePreference,
  type ThemeMode
} from "@/lib/theme"

export function ThemeToggleItem() {
  const [theme, setTheme] = createSignal<ThemeMode>("system")
  let tabsListElement!: HTMLDivElement

  onMount(() => {
    const initialTheme = readStoredThemePreference()

    setTheme(initialTheme)
    applyThemePreference(initialTheme)
  })

  const selectTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme)
    saveThemePreference(nextTheme)
    applyThemePreference(nextTheme)
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
      class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground"
      closeOnSelect={false}
      onFocus={(event) => {
        if (event.target === event.currentTarget) focusActiveTab()
      }}
    >
      <div class="flex w-full items-center gap-2">
        <PaletteIcon class="size-4 text-muted-foreground" />
        <span>Theme</span>

        <Tabs
          class="ml-auto"
          onKeyDown={handleTabsKeyDown}
          onChange={(nextTheme) => {
            if (isThemeMode(nextTheme)) selectTheme(nextTheme)
          }}
          value={theme()}
        >
          <TabsList class="h-6!" ref={tabsListElement}>
            <TabsTrigger aria-label="System" class="size-5 p-0" value="system">
              <Monitor class="size-3" />
            </TabsTrigger>
            <TabsTrigger aria-label="Light" class="size-5 p-0" value="light">
              <Sun class="size-3" />
            </TabsTrigger>
            <TabsTrigger aria-label="Dark" class="size-5 p-0" value="dark">
              <Moon class="size-3" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </DropdownMenuItem>
  )
}
