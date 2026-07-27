import { createAuthPlugin } from "../../lib/create-auth-plugin"
import {
  type AnonymousLocalization,
  anonymousLocalization
} from "./anonymous-localization"

export type AnonymousPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `AnonymousLocalization`
   */
  localization?: Partial<AnonymousLocalization>
}

/**
 * Adds a localized anonymous sign-in action to supported authentication UIs.
 *
 * Pair this UI plugin with Better Auth's `anonymous()` server plugin and
 * `anonymousClient()` client plugin.
 */
export const anonymousPlugin = createAuthPlugin(
  "anonymous",
  (options: AnonymousPluginOptions = {}) => ({
    localization: {
      ...anonymousLocalization,
      ...options.localization
    }
  })
)
