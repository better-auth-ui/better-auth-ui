/**
 * View path segments for authentication routes.
 */
export interface AuthViewPaths {
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
 * View path configuration for authentication and settings routes.
 */
export type ViewPaths = {
  /** Auth view path segments */
  auth: AuthViewPaths
  /** Settings view path segments */
  settings: SettingsViewPaths
}

export const viewPaths: ViewPaths = {
  auth: {
    signIn: "sign-in",
    signUp: "sign-up",
    forgotPassword: "forgot-password",
    resetPassword: "reset-password",
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
 * Valid settings view key.
 */
export type SettingsView = keyof SettingsViewPaths
