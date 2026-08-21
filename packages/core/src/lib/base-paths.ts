/**
 * Base path configuration for authentication, settings, organization, and admin routes.
 */
export type BasePaths = {
  /**
   * Base path for application administration routes
   * @default "/admin"
   */
  admin: string
  /**
   * Base path for authentication routes
   * @default "/auth"
   */
  auth: string
  /**
   * Base path for settings routes
   * @default "/settings"
   */
  settings: string
  /**
   * Base path for organization management routes
   * @default "/organization"
   */
  organization: string
}

export const basePaths: BasePaths = {
  admin: "/admin",
  auth: "/auth",
  settings: "/settings",
  organization: "/organization"
}
