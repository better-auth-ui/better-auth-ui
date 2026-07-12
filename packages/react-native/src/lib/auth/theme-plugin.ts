import { createAuthPlugin } from "@better-auth-ui/core"
import {
  themePlugin as coreThemePlugin,
  type ThemeLocalization
} from "@better-auth-ui/core/plugins"
import { useColorScheme } from "nativewind"
import { Appearance } from "../../components/auth/theme/appearance"
import { ThemeToggleItem } from "../../components/auth/theme/theme-toggle-item"

/** Theme hook shape (compatible with next-themes' `useTheme`). */
export type UseThemeHook = () => {
  theme?: string
  setTheme: (theme: string) => void
  themes?: string[]
}

export type ThemePluginOptions = {
  /** Override the plugin's default localization strings. */
  localization?: Partial<ThemeLocalization>
  /** Available theme options. @default ["system", "light", "dark"] */
  themes?: string[]
  /**
   * Theme hook read by the slot components. Defaults to nativewind's
   * `useColorScheme`, so no wiring is needed for the common case.
   */
  useTheme?: UseThemeHook
}

const THEMES = ["system", "light", "dark"]

/** Default theme source: nativewind's color scheme. */
const useNativewindTheme: UseThemeHook = () => {
  const { colorScheme, setColorScheme } = useColorScheme()
  return {
    theme: colorScheme,
    setTheme: (theme) => setColorScheme(theme as "light" | "dark" | "system"),
    themes: THEMES
  }
}

/**
 * React Native theme plugin. Registers the `Appearance` account card + the
 * `ThemeToggleItem` user-menu item, and drives nativewind's color scheme by
 * default (pass `useTheme` to integrate a custom theme source instead).
 */
export const themePlugin = createAuthPlugin(
  coreThemePlugin.id,
  ({ useTheme, ...rest }: ThemePluginOptions = {}) => {
    const base = coreThemePlugin({
      setTheme: () => {},
      themes: THEMES,
      ...rest
    })
    return {
      ...base,
      useTheme: useTheme ?? useNativewindTheme,
      userMenuItems: [ThemeToggleItem],
      accountCards: [Appearance]
    }
  }
)
