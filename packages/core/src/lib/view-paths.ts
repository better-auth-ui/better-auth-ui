/**
 * The view-path interfaces below are augmentation points: a plugin adds its
 * own views by merging into them, which widens `AuthView` / `SettingsView` /
 * `AdminView` accordingly.
 *
 * Built-in plugins augment via the relative specifier (`"../../lib/view-paths"`).
 * Third-party plugins target the published subpath, which resolves to this
 * same module:
 *
 * ```ts
 * declare module "@better-auth-ui/core/lib/view-paths" {
 *   interface SettingsViewPaths {
 *     cart?: string
 *   }
 * }
 * ```
 *
 * Without that subpath the interfaces are only reachable from inside the
 * package, so external plugins have to cast their view keys even though
 * `<Settings>` and `<Admin>` already merge every plugin's `viewPaths` at
 * runtime.
 */

/**
 * View path segments for authentication routes.
 *
 * @remarks Direct implementations must include the `callback` and `error`
 * paths. Provider `viewPaths` overrides remain partial and merge with these
 * defaults.
 */
export interface AuthViewPaths {
  /**
   * Path segment for authentication callback results
   * @default "callback"
   */
  callback: string
  /**
   * Path segment for authentication callback errors
   * @default "error"
   */
  error: string
  /**
   * Path segment for the authenticated redirect view
   * @default "redirect"
   */
  redirect: string
  /**
   * Path segment for the sign-in view
   * @default "sign-in"
   */
  signIn: string
  /**
   * Path segment for the sign-up view
   * @default "sign-up"
   */
  signUp: string
  /**
   * Path segment for the forgot password view
   * @default "forgot-password"
   */
  forgotPassword: string
  /**
   * Path segment for the reset password view
   * @default "reset-password"
   */
  resetPassword: string
  /**
   * Path segment for the reset-link-sent confirmation view
   * @default "reset-link-sent"
   */
  resetLinkSent: string
  /**
   * Path segment for the sign-out view
   * @default "sign-out"
   */
  signOut: string
  /**
   * Path segment for the verify email view
   * @default "verify-email"
   */
  verifyEmail: string
}

/**
 * View path segments for settings routes.
 */
export interface SettingsViewPaths {
  /**
   * Path segment for the account settings view
   * @default "account"
   */
  account: string
  /**
   * Path segment for the security settings view
   * @default "security"
   */
  security: string
}

/**
 * View path segments for application administration routes.
 */
export interface AdminViewPaths {
  /**
   * Path segment for user management
   * @default "users"
   */
  users: string
}

/**
 * View path configuration for authentication and settings routes.
 */
export type ViewPaths = {
  /** Admin view path segments */
  admin: AdminViewPaths
  /** Auth view path segments */
  auth: AuthViewPaths
  /** Settings view path segments */
  settings: SettingsViewPaths
}

export const viewPaths: ViewPaths = {
  admin: {
    users: "users"
  },
  auth: {
    callback: "callback",
    error: "error",
    redirect: "redirect",
    signIn: "sign-in",
    signUp: "sign-up",
    forgotPassword: "forgot-password",
    resetPassword: "reset-password",
    resetLinkSent: "reset-link-sent",
    signOut: "sign-out",
    verifyEmail: "verify-email"
  },
  settings: {
    account: "account",
    security: "security"
  }
}

/**
 * Valid auth view key.
 */
export type AuthView = keyof AuthViewPaths

/**
 * Valid admin view key.
 */
export type AdminView = keyof AdminViewPaths

/**
 * Valid settings view key.
 */
export type SettingsView = keyof SettingsViewPaths
