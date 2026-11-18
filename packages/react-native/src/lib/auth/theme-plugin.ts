import { createAuthPlugin } from "@better-auth-ui/core"

import { Appearance } from "../../components/auth/theme/appearance"
import { ThemeToggleItem } from "../../components/auth/theme/theme-toggle-item"
import { type ThemePluginOptions, themePluginBase } from "./theme-plugin-base"

export type { ThemePluginOptions, UseThemeHook } from "./theme-plugin-base"

/**
 * React Native theme plugin. Registers the `Appearance` account card + the
 * `ThemeToggleItem` user-menu item, and drives the library's built-in theme
 * store by default (pass `useTheme` to integrate a custom theme source, e.g.
 * next-themes, instead).
 */
export const themePlugin = createAuthPlugin(
  themePluginBase.id,
  (options: ThemePluginOptions = {}) => ({
    ...themePluginBase(options),
    userMenuItems: [ThemeToggleItem],
    accountCards: [Appearance]
  })
)
