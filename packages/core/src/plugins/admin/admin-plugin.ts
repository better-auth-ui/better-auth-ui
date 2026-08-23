import { createAuthPlugin } from "../../lib/create-auth-plugin"
import { type AdminLocalization, adminLocalization } from "./admin-localization"

export type AdminPluginOptions = {
  /** Roles Better Auth treats as administrators. @default ["admin"] */
  adminRoles?: string | readonly string[]
  /** User IDs Better Auth treats as administrators regardless of role. */
  adminUserIds?: readonly string[]
  /** Default role selected when an administrator creates a user. @default "user" */
  defaultRole?: string
  /** Where to navigate after starting an impersonation session. */
  impersonationRedirectTo?: string
  /**
   * Override the plugin's default localization strings.
   * @remarks `AdminLocalization`
   */
  localization?: Partial<AdminLocalization>
  /** Number of users loaded per page. Clamped to 1-100. @default 20 */
  pageSize?: number
  /** Roles offered by user-management forms. @default ["user", "admin"] */
  roles?: readonly string[]
  /** Show session IP addresses. @default false */
  showIpAddress?: boolean
}

const resolvePageSize = (pageSize?: number) => {
  const value = pageSize ?? 20
  return Number.isFinite(value)
    ? Math.min(100, Math.max(1, Math.floor(value)))
    : 20
}

const resolveRoles = (roles?: readonly string[]) => {
  const resolved = Array.from(
    new Set(roles?.map((role) => role.trim()).filter(Boolean))
  )
  return resolved.length ? resolved : ["user", "admin"]
}

const resolveValues = (values?: string | readonly string[]) => {
  const entries = typeof values === "string" ? [values] : values
  return Array.from(
    new Set(entries?.map((value) => value.trim()).filter(Boolean))
  )
}

/** Check whether a target requires Better Auth's `user:impersonate-admins` permission. */
export function isAdminTarget(
  user: { id: string; role?: string | null },
  adminRoles: readonly string[] = ["admin"],
  adminUserIds: readonly string[] = []
) {
  if (adminUserIds.includes(user.id)) return true

  const roles = user.role
    ?.split(",")
    .map((role) => role.trim())
    .filter(Boolean)

  return roles?.some((role) => adminRoles.includes(role)) ?? false
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
  (options: AdminPluginOptions = {}) => {
    const roles = resolveRoles(options.roles)
    const defaultRole = options.defaultRole?.trim() || roles[0] || "user"
    const adminRoles = resolveValues(options.adminRoles)

    return {
      adminRoles: adminRoles.length ? adminRoles : ["admin"],
      adminUserIds: resolveValues(options.adminUserIds),
      defaultRole,
      impersonationRedirectTo: options.impersonationRedirectTo,
      localization: { ...adminLocalization, ...options.localization },
      pageSize: resolvePageSize(options.pageSize),
      roles: roles.includes(defaultRole) ? roles : [defaultRole, ...roles],
      showIpAddress: options.showIpAddress ?? false
    }
  }
)
