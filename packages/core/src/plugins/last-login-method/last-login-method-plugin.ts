import { createAuthPlugin } from "../../lib/create-auth-plugin"
import {
  type LastLoginMethodLocalization,
  lastLoginMethodLocalization
} from "./last-login-method-localization"

export type LastLoginMethodPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `LastLoginMethodLocalization`
   */
  localization?: Partial<LastLoginMethodLocalization>
}

/**
 * Enables last-login-method indicators in supported authentication views.
 *
 * Pair this UI plugin with Better Auth's `lastLoginMethod()` server plugin
 * and `lastLoginMethodClient()` client plugin.
 */
export const lastLoginMethodPlugin = createAuthPlugin(
  "lastLoginMethod",
  (options: LastLoginMethodPluginOptions = {}) => ({
    localization: {
      ...lastLoginMethodLocalization,
      ...options.localization
    }
  })
)
