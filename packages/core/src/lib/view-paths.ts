/**
 * All view path segments.
 */
export const viewPaths = {
  auth: {
    signIn: "sign-in",
    signUp: "sign-up",
    magicLink: "magic-link",
    forgotPassword: "forgot-password",
    resetPassword: "reset-password",
    signOut: "sign-out"
  },
  settings: {
    account: "account",
    security: "security"
  }
}

/**
 * Provides type information for the nested view path structure used throughout
 * the application for routing and navigation.
 */
export type ViewPaths = typeof viewPaths

/**
 * Valid auth view key.
 */
export type AuthView = keyof ViewPaths["auth"]

/**
 * Valid settings view key.
 */
export type SettingsView = keyof ViewPaths["settings"]
