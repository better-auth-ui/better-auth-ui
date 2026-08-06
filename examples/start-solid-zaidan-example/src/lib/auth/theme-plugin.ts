import { createAuthPlugin } from "@better-auth-ui/core"
import {
  type ThemePluginOptions as CoreThemePluginOptions,
  themePlugin as coreThemePlugin,
  type ThemeLocalization
} from "@better-auth-ui/core/plugins/theme"
import { Appearance } from "@/components/auth/theme/appearance"
import { ThemeToggleItem } from "@/components/auth/theme/theme-toggle-item"
import { applyThemePreference, isThemeMode } from "@/lib/theme"

export type ThemePluginOptions = Partial<
  Pick<CoreThemePluginOptions, "localization" | "theme" | "themes">
> & {
  /** Function to set the theme. Defaults to the copied Solid theme helper. */
  setTheme?: CoreThemePluginOptions["setTheme"]
}

export type { ThemeLocalization }

const setLocalTheme = (theme: string) => {
  if (isThemeMode(theme)) applyThemePreference(theme)
}

export const themePlugin = createAuthPlugin(
  coreThemePlugin.id,
  (options: ThemePluginOptions = {}) => {
    const core = coreThemePlugin({
      localization: options.localization,
      setTheme: options.setTheme ?? setLocalTheme,
      theme: options.theme,
      themes: options.themes
    })

    return {
      ...core,
      theme: options.theme,
      accountCards: [Appearance],
      userMenuItems: [ThemeToggleItem]
    }
  }
)
