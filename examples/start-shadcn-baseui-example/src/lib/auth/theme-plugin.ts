import { createAuthPlugin } from "@better-auth-ui/core"
import {
  themePlugin as coreThemePlugin,
  type ThemeLocalization
} from "@better-auth-ui/core/plugins"

import { Appearance } from "@/components/auth/theme/appearance"
import { ThemeToggleItem } from "@/components/auth/theme/theme-toggle-item"

/**
 * Hook shape compatible with `next-themes`' `useTheme` and similar APIs. The
 * hook is invoked inside the plugin factory so consumers can register the
 * plugin in the same component as their `<ThemeProvider>` without an extra
 * inner component.
 */
export type UseThemeHook = () => {
  theme?: string
  setTheme: (theme: string) => void
  themes?: string[]
}

type CommonThemeOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `ThemeLocalization`
   */
  localization?: Partial<ThemeLocalization>
  /**
   * Available theme options.
   * @default ["system", "light", "dark"]
   */
  themes?: string[]
}

export type ThemePluginOptions = CommonThemeOptions &
  (
    | {
        /**
         * A theme hook (e.g. next-themes' `useTheme`) called inside the
         * plugin's slot components on every render. The hook owns the live
         * theme value, so `theme`/`setTheme` are not accepted in this form.
         */
        useTheme: UseThemeHook
        theme?: never
        setTheme?: never
      }
    | {
        /**
         * Current theme value. Required when not using a hook so slot
         * components can highlight the active option. Pass it from a
         * stateful source (e.g. `useState`, Context) so updates flow
         * through `<AuthProvider>` and re-render slot components.
         * @remarks Do not memoize the static call (e.g. wrap
         * `themePlugin({ theme, setTheme })` in `useMemo`): `theme` is
         * captured at factory-creation time, so a memoized closure will
         * keep returning the stale value and slot components will stop
         * reflecting theme changes. Let the factory re-run each render.
         */
        theme: string
        /** Setter that updates the value `theme` is read from. */
        setTheme: (theme: string) => void
        useTheme?: never
      }
  )

export const themePlugin = createAuthPlugin(
  coreThemePlugin.id,
  ({ useTheme, ...rest }: ThemePluginOptions) => {
    // No-op `setTheme` baseline keeps core's required option satisfied on the
    // hook branch (where the consumer doesn't pass a setter); on the static
    // branch the spread overrides it with the consumer's real setter.
    const base = coreThemePlugin({ setTheme: () => {}, ...rest })
    return {
      ...base,
      // Slot components always call `plugin.useTheme()` — invoking the hook
      // inside their render keeps it in scope of any `<ThemeProvider>` the
      // consumer mounts. On the static branch the factory re-runs on every
      // parent render, so the synthesized closure stays in sync with the
      // consumer's `theme` state.
      useTheme:
        useTheme ??
        (() => ({
          theme: base.theme,
          setTheme: base.setTheme,
          themes: base.themes
        })),
      userMenuItems: [ThemeToggleItem],
      accountCards: [Appearance]
    }
  }
)
