import type { AuthPlugin } from "../lib/auth-plugin"
import { useAuth } from "../lib/auth-provider"

/**
 * Plugin factory shape accepted by {@link useAuthPlugin}. The factory is not
 * invoked because its static `id` is sufficient to find the registered plugin.
 */
export type AuthPluginFactory<T extends AuthPlugin = AuthPlugin> = {
  id: string
  // biome-ignore lint/suspicious/noExplicitAny: factory arguments vary by plugin
  (...args: any[]): T
}

/**
 * Access a plugin registered on the nearest `AuthProvider`.
 *
 * Throws when the plugin is not registered because plugin-owned components
 * should only render while their plugin is active.
 */
export function useAuthPlugin<T extends AuthPlugin>(
  pluginFactory: AuthPluginFactory<T>
): T {
  const plugin = useAuth().plugins.find(
    (candidate) => candidate.id === pluginFactory.id
  )

  if (!plugin) {
    throw new Error(
      `[Better Auth UI] useAuthPlugin: plugin "${pluginFactory.id}" is not registered on AuthProvider.`
    )
  }

  return plugin as T
}
