"use client"

import { useAuthPlugin } from "@better-auth-ui/react"
import { Monitor, Moon, PaletteIcon, Sun } from "lucide-react"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import { themePlugin } from "@/lib/auth/theme-plugin"

/** Select a theme using the menu's keyboard and selection behavior. */
export function ThemeToggleItem() {
  const { useTheme, localization } = useAuthPlugin(themePlugin)
  const { theme, setTheme, themes = [] } = useTheme()
  const choices = [
    { id: "system", label: localization.system, Icon: Monitor },
    { id: "light", label: localization.light, Icon: Sun },
    { id: "dark", label: localization.dark, Icon: Moon }
  ].filter((choice) => themes.includes(choice.id))

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger textValue={localization.theme}>
        <PaletteIcon data-icon="inline-start" />
        {localization.theme}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent aria-label={localization.theme}>
        <DropdownMenuGroup
          selectionMode="single"
          selectedKeys={theme ? [theme] : []}
          onSelectionChange={(keys) => {
            if (keys === "all") return
            const selected = [...keys][0]
            if (selected !== undefined) setTheme(String(selected))
          }}
        >
          {choices.map(({ id, label, Icon }) => (
            <DropdownMenuItem
              key={id}
              id={id}
              textValue={label}
              shouldCloseOnSelect={false}
            >
              <Icon data-icon="inline-start" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
