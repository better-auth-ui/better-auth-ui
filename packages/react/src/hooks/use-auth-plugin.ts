"use client"

import { useAuth } from "../components/auth/auth-provider"
import type { AuthPlugin } from "../lib/auth-plugin"

/**
 * Plugin factory shape accepted by {@link useAuthPlugin}. The `id` is read as
 * a static property — the factory is never invoked — so plugins with required
 * options (e.g. `themePlugin`'s `setTheme`) can still be looked up.
 *
 * Always produced by `createAuthPlugin` from `@better-auth-ui/core`.
 */
export type AuthPluginFactory<T extends AuthPlugin = AuthPlugin> = {
  id: string
  // Factory args vary by plugin.
  (...args: any[]): T
}

/**
 * Access a registered plugin by passing its factory.
 *
 * Use inside plugin slot components to read plugin state (localization,
 * config, etc.) without prop drilling.
 *
 * Throws if the plugin isn't registered on `AuthProvider` — this is an
 * invariant: plugin slot components only render when their plugin is in
 * `plugins`.
 *
 * @example
 * ```tsx
 * function PasskeyButton() {
 *   const { localization } = useAuthPlugin(passkeyPlugin)
 *   return <button>{localization.passkey}</button>
 * }
 * ```
 */
export function useAuthPlugin<T extends AuthPlugin>(
  pluginFactory: AuthPluginFactory<T>
): T {
  const { plugins } = useAuth()
  const plugin = plugins?.find((p) => p.id === pluginFactory.id)

  if (!plugin) {
    throw new Error(
      `[Better Auth UI] useAuthPlugin: plugin "${pluginFactory.id}" is not registered on AuthProvider.`
    )
  }

  return plugin as T
}
