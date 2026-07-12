import { useAuthPlugin } from "@better-auth-ui/react"
import { Pressable, Text, View } from "react-native"
import { themePlugin } from "../../../lib/auth/theme-plugin"
import { cn } from "../../../lib/cn"
import { useThemeColors } from "../../../lib/theme-colors"
import { Display, Moon, Palette, Sun } from "../../../primitives/ui-icons"

export type ThemeToggleItemProps = {
  className?: string
  /** When true, the subtitle line (email when name/username is shown) is hidden. */
  hideSubtitle?: boolean
}

const OPTIONS = [
  { id: "system", Icon: Display },
  { id: "light", Icon: Sun },
  { id: "dark", Icon: Moon }
] as const

/**
 * Theme toggle row rendered inside `UserButton`'s menu. Mirrors heroui's
 * `ThemeToggleItem`, adapted for React Native: heroui nests a keyboard-
 * navigable `Tabs` widget inside a `Dropdown.Item` and wires a pile of DOM
 * focus/`role` plumbing (`querySelector('[role="tab"]')`,
 * `closest('[role="menuitem"]')`, `shouldCloseOnSelect={false}`) purely to
 * let arrow keys reach the nested tabs without escaping the enclosing menu.
 * None of that has an RN equivalent — there's no DOM, no keyboard roving
 * tabindex, no hover. Instead this renders a single row (icon + label) with
 * a small segmented light/dark/system control: each option is a plain
 * `Pressable` that calls `setTheme` directly. Because the row is a bare
 * `View` (not a menu item wired to an `onSelect`-then-close callback), it
 * behaves like `shouldCloseOnSelect={false}` automatically — pressing an
 * option never closes the enclosing menu sheet.
 */
export function ThemeToggleItem({ className }: ThemeToggleItemProps) {
  const { useTheme, localization } = useAuthPlugin(themePlugin)
  const { theme, setTheme, themes = [] } = useTheme()
  const colors = useThemeColors()

  const availableOptions = OPTIONS.filter((option) =>
    themes.includes(option.id)
  )

  return (
    <View className={cn("flex-row items-center gap-2 px-3 py-2", className)}>
      <Palette width={18} height={18} color={colors.muted} />

      <Text className="flex-1 text-sm text-foreground">
        {localization.theme}
      </Text>

      <View className="flex-row items-center gap-0.5 rounded-lg bg-surface-secondary p-0.5">
        {availableOptions.map(({ id, Icon }) => {
          const isSelected = theme === id
          const label =
            id === "system"
              ? localization.system
              : id === "light"
                ? localization.light
                : localization.dark

          return (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={label}
              onPress={() => setTheme(id)}
              className={cn(
                "h-6 w-6 items-center justify-center rounded-md",
                isSelected && "bg-surface"
              )}
            >
              <Icon
                width={12}
                height={12}
                color={isSelected ? colors.foreground : colors.muted}
              />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
