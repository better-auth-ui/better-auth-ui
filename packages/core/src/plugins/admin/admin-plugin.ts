import { createAuthPlugin } from "../../lib/create-auth-plugin"
import { type AdminLocalization, adminLocalization } from "./admin-localization"

export type AdminPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `AdminLocalization`
   */
  localization?: Partial<AdminLocalization>
}

export type ImpersonatingSession = {
  session: {
    impersonatedBy: string
  }
}

/**
 * Check whether a Better Auth session belongs to an impersonated user.
 */
export function isImpersonatingSession(
  session: unknown
): session is ImpersonatingSession {
  if (
    !session ||
    typeof session !== "object" ||
    !("session" in session) ||
    !session.session ||
    typeof session.session !== "object" ||
    !("impersonatedBy" in session.session)
  ) {
    return false
  }

  return (
    typeof session.session.impersonatedBy === "string" &&
    session.session.impersonatedBy.length > 0
  )
}

/**
 * Adds UI integrations for Better Auth's admin plugin.
 *
 * Pair this UI plugin with Better Auth's `admin()` server plugin and
 * `adminClient()` client plugin.
 */
export const adminPlugin = createAuthPlugin(
  "admin",
  (options: AdminPluginOptions = {}) => ({
    localization: { ...adminLocalization, ...options.localization }
  })
)
