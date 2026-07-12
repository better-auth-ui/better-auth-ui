import { createAuthPlugin } from "@better-auth-ui/core"
import {
  themePlugin as coreThemePlugin,
  type ThemeLocalization
} from "@better-auth-ui/core/plugins"
import { Appearance } from "../../components/auth/theme/appearance"
import { ThemeToggleItem } from "../../components/auth/theme/theme-toggle-item"
import { useThemePreference } from "../theme-colors"

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
   * Theme hook read by the slot components. Defaults to the library's built-in
   * (engine-agnostic) theme store, so no wiring is needed for the common case.
   */
  useTheme?: UseThemeHook
}

const THEMES = ["system", "light", "dark"]

/**
 * React Native theme plugin. Registers the `Appearance` account card + the
 * `ThemeToggleItem` user-menu item, and drives the library's built-in theme
 * store by default (pass `useTheme` to integrate a custom theme source, e.g.
 * next-themes, instead).
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
      useTheme: useTheme ?? useThemePreference,
      userMenuItems: [ThemeToggleItem],
      accountCards: [Appearance]
    }
  }
)
