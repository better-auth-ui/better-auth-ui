import type { SocialProvider } from "better-auth/social-providers"
import { defaultToast, type Toast } from "./auth-toast"
import { basePaths } from "./base-paths"
import { type Localization, localization } from "./localization"
import { type ViewPaths, viewPaths } from "./view-paths"

/**
 * Configuration options for email and password authentication.
 */
export type EmailAndPasswordConfig = {
  /**
   * Whether email/password authentication is enabled
   * @default true
   */
  enabled: boolean
  /**
   * Whether to show a confirm password field on sign-up forms
   */
  confirmPassword?: boolean
  /**
   * Whether users can reset forgotten passwords
   * @default true
   */
  forgotPassword: boolean
  /**
   * Maximum password length
   * @default 128
   */
  maxPasswordLength?: number
  /**
   * Minimum password length
   * @default 8
   */
  minPasswordLength?: number
  /**
   * Maximum password length
   * @default 128
   */
  /** Whether to show a "Remember me" checkbox on sign-in forms */
  rememberMe?: boolean
  /** Whether email verification is required before account activation */
  requireEmailVerification?: boolean
}

/**
 * Available theme options for the application.
 */
export type Theme = "system" | "light" | "dark"

/**
 * Configuration options for user settings.
 */
export type SettingsConfig = {
  /**
   * Whether the settings section is enabled
   * @default true
   */
  enabled?: boolean
  /**
   * Function to set the application theme
   * @param theme - The theme value to set
   */
  setTheme?: (theme: string) => void
  /**
   * Current theme value
   */
  theme?: string
  /**
   * Available theme options to display in the theme switcher
   * @default ["system", "light", "dark"]
   */
  themes?: Theme[]
}

/**
 * Core authentication configuration interface.
 *
 * Defines the base structure for authentication settings including paths,
 * providers, navigation functions, and feature flags.
 */
export interface AuthConfig {
  /** Base paths for different application sections */
  basePaths: {
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
  /**
   * Base URL for API endpoints (optional)
   * @default ""
   */
  baseURL: string
  /**
   * Email and password authentication configuration
   * @default { enabled: true, forgotPassword: true, minPasswordLength: 8, maxPasswordLength: 128 }
   */
  emailAndPassword?: EmailAndPasswordConfig
  /** Localization strings for UI components. */
  localization: Localization
  /** Whether magic link (passwordless) authentication is enabled */
  magicLink?: boolean
  /** Whether multi-session support is enabled */
  multiSession?: boolean
  /**
   * Default redirect path after successful authentication
   * @default "/"
   */
  redirectTo: string
  /**
   * Settings section configuration
   * @default { enabled: true }
   */
  settings: SettingsConfig
  /**
   * List of enabled social authentication providers
   * @remarks `SocialProvider[]`
   */
  socialProviders?: SocialProvider[]
  /** View path mappings for different authentication views */
  viewPaths: ViewPaths
  /**
   * Toast notification configuration for user feedback.
   * @remarks `Toast`
   */
  toast: Toast
  /**
   * Function to navigate to a new path
   * @param options - Navigation options with href and optional replace flag
   * @default window.location.href = href (or window.location.replace if replace: true)
   * @example
   * // TanStack Router
   * navigate={navigate}
   * // Next.js
   * navigate={({href, replace}) => replace ? router.replace(href) : router.push(href)}
   */
  navigate: (options: { href: string; replace?: boolean }) => void
}

export const defaultConfig: AuthConfig = {
  basePaths,
  baseURL: "",
  emailAndPassword: {
    enabled: true,
    forgotPassword: true,
    rememberMe: false,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  redirectTo: "/",
  settings: {
    enabled: true,
    themes: ["system", "light", "dark"]
  },
  viewPaths,
  localization,
  navigate: ({ href, replace }) => {
    if (replace) {
      window.location.replace(href)
    } else {
      window.location.href = href
    }
  },
  toast: {
    error: defaultToast,
    success: defaultToast,
    info: defaultToast
  }
}
