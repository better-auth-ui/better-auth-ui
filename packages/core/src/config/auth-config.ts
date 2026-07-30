import type { SocialProvider } from "better-auth/social-providers"

import type { AuthPlugin } from "../lib/auth-plugin"
import { type BasePaths, basePaths } from "../lib/base-paths"
import { type Localization, localization } from "../lib/localization"
import { resizeAvatar } from "../lib/utils"
import { type AuthView, type ViewPaths, viewPaths } from "../lib/view-paths"
import type { AdditionalFields } from "./additional-fields-config"
import type { AvatarConfig } from "./avatar-config"
import type { EmailAndPasswordConfig } from "./email-and-password-config"

/**
 * Options passed to {@link AuthConfig.navigate}.
 *
 * `to` is the composed path used by path-based routers (expo-router, web,
 * TanStack, Next). `view` and `params` are additive, optional hints used by
 * name-based routers (React Navigation) and state-only hosting (the React
 * Native state adapter) that have no URL to read — path routers can ignore
 * them, so this stays backward compatible with every existing web adapter.
 */
export interface NavigateOptions {
  /** Composed path — used by path-based routers (expo-router, web). */
  to: string
  /**
   * Semantic view key — used by name-based routers and state-only hosting
   * that navigate by identity rather than by URL.
   * @remarks `AuthView`
   */
  view?: AuthView
  /**
   * Route params carried alongside the view (e.g. deep-link tokens such as a
   * password-reset `token`) for routers that don't parse them from a URL.
   */
  params?: Record<string, string>
  /** Replace the current history entry instead of pushing a new one. */
  replace?: boolean
}

/** Navigation callback supplied by the host router. */
export type NavigateFn = (options: NavigateOptions) => void

/**
 * Core authentication configuration interface.
 *
 * Defines the base structure for authentication settings including paths,
 * providers, navigation functions, and feature flags.
 */
export interface AuthConfig {
  /**
   * Additional user fields rendered on sign-up and the user profile.
   * @remarks `AdditionalFields`
   */
  additionalFields?: AdditionalFields
  /**
   * Avatar upload, optimization, and deletion configuration.
   * @remarks `AvatarConfig`
   * @default { enabled: true, resize: resizeAvatar, size: 256, extension: "png" }
   */
  avatar: AvatarConfig
  /**
   * Base paths for different application sections
   * @remarks `BasePaths`
   */
  basePaths: BasePaths
  /**
   * Base URL for API endpoints (optional)
   * @default ""
   */
  baseURL: string
  /**
   * Email and password authentication configuration
   * @remarks `EmailAndPasswordConfig`
   */
  emailAndPassword: EmailAndPasswordConfig
  /**
   * Localization strings for UI components
   * @remarks `Localization`
   */
  localization: Localization
  /**
   * Registered auth plugins. UI packages widen the element type via the
   * `AuthPluginRegister` module-augmentation slot.
   * @remarks `AuthPlugin[]`
   * @default []
   */
  plugins: AuthPlugin[]
  /**
   * Default redirect path after successful authentication
   * @default "/"
   */
  redirectTo: string
  /**
   * Allow users to link multiple accounts from the same social provider.
   * When false, providers already linked to the account are hidden from the available-to-link list.
   * @default true
   */
  multipleAccountsPerProvider?: boolean
  /**
   * List of enabled social authentication providers
   * @remarks `SocialProvider[]`
   */
  socialProviders?: SocialProvider[]
  /**
   * View path mappings for different authentication views
   * @remarks `ViewPaths`
   */
  viewPaths: ViewPaths
  /**
   * Function to navigate between auth views.
   *
   * Receives the composed `to` path plus optional additive `view`/`params`
   * hints for name-based / state-only routers (see {@link NavigateOptions}).
   * Path-based routers can read `to` and ignore the rest.
   * @remarks `NavigateFn`
   * @default window.location.href = to (or window.location.replace if replace: true)
   * @example
   * // TanStack Router
   * navigate={navigate}
   * // Next.js
   * navigate={({ to, replace }) => replace ? router.replace(to) : router.push(to)}
   */
  navigate: NavigateFn
}

export const defaultAuthConfig: Omit<AuthConfig, "authClient"> = {
  avatar: {
    enabled: true,
    resize: resizeAvatar,
    size: 256,
    extension: "png"
  },
  basePaths,
  baseURL: "",
  emailAndPassword: {
    enabled: true,
    forgotPassword: true,
    name: true,
    rememberMe: false,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  plugins: [],
  redirectTo: "/",
  viewPaths,
  localization,
  navigate: ({ to, replace }) => {
    if (replace) {
      window.location.replace(to)
    } else {
      window.location.href = to
    }
  }
}
