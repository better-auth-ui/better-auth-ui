import { createAuthPlugin } from "@better-auth-ui/core"
import {
  themePlugin as coreThemePlugin,
  type ThemeLocalization
} from "@better-auth-ui/core/plugins/theme"
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
 * Theme plugin without its slot components. Slot components look the plugin
 * up through this factory, which shares the `themePlugin` id, so they can
 * read `useTheme` without importing the module that registers them.
 */
export const themePluginBase = createAuthPlugin(
  coreThemePlugin.id,
  ({ useTheme, ...rest }: ThemePluginOptions = {}) => {
    const base = coreThemePlugin({
      setTheme: () => {},
      themes: THEMES,
      ...rest
    })
    return {
      ...base,
      useTheme: useTheme ?? useThemePreference
    }
  }
)
