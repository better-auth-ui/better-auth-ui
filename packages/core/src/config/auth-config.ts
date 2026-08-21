import type { AuthClient } from "../lib/auth-client"
import {
  type AuthLocale,
  defaultAuthLocale,
  localizeAuthPlugins
} from "../lib/auth-locale"
import type { AuthPlugin } from "../lib/auth-plugin"
import { type BasePaths, basePaths } from "../lib/base-paths"
import type { DeepPartial } from "../lib/deep-partial"
import { type Localization, localization } from "../lib/localization"
import { deepmerge, resizeAvatar } from "../lib/utils"
import { type ViewPaths, viewPaths } from "../lib/view-paths"
import type {
  AdditionalField,
  AdditionalFields
} from "./additional-fields-config"
import type { AvatarConfig } from "./avatar-config"
import type { EmailAndPasswordConfig } from "./email-and-password-config"
import type { AuthSocialProvider } from "./social-provider-config"

export type SocialSignInMode = "redirect" | "popup"

/**
 * Core authentication configuration interface.
 *
 * Defines the base structure for authentication settings including paths,
 * providers, navigation functions, and feature flags.
 */
export interface AuthConfig<TAuthClient extends AuthClient = AuthClient> {
  /**
   * The Better Auth client instance used for authentication operations.
   */
  authClient: TAuthClient
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
   * Language metadata and translated messages for all auth components.
   * @remarks `AuthLocale`
   * @default `defaultAuthLocale`
   */
  locale: AuthLocale
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
   * Built-in providers can use their string ID. Custom and Generic OAuth
   * providers use `{ id, label, icon }`.
   * @remarks `AuthSocialProvider[]`
   */
  socialProviders?: AuthSocialProvider[]
  /**
   * How social sign-in opens the provider flow.
   * Popup mode requires Better Auth's experimental `oauthPopupClient` action.
   * @default "redirect"
   */
  socialSignInMode: SocialSignInMode
  /**
   * View path mappings for different authentication views
   * @remarks `ViewPaths`
   */
  viewPaths: ViewPaths
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
  navigate: (options: { to: string; replace?: boolean }) => void
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
    strengthMeter: true,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  plugins: [],
  redirectTo: "/",
  socialSignInMode: "redirect",
  viewPaths,
  localization,
  locale: defaultAuthLocale,
  navigate: ({ to, replace }) => {
    if (replace) {
      window.location.replace(to)
    } else {
      window.location.href = to
    }
  }
}

export type AuthConfigOptions<TAuthClient extends AuthClient = AuthClient> =
  DeepPartial<Omit<AuthConfig<TAuthClient>, "authClient" | "locale">> & {
    authClient: TAuthClient
    /** Imported locale bundle. Defaults to English (`en-US`). */
    locale?: AuthLocale
  }

/** Resolves defaults, locale messages, plugin messages, and consumer overrides. */
export function resolveAuthConfig<TAuthClient extends AuthClient = AuthClient>(
  options: AuthConfigOptions<TAuthClient>
): AuthConfig<TAuthClient> {
  const locale = options.locale ?? defaultAuthLocale
  const resolvedLocalization = deepmerge(
    deepmerge(localization, locale.localization),
    options.localization ?? {}
  )
  const plugins = localizeAuthPlugins(options.plugins ?? [], locale)
  const mergedConfig = deepmerge<Omit<AuthConfig<TAuthClient>, "authClient">>(
    defaultAuthConfig as Omit<AuthConfig<TAuthClient>, "authClient">,
    {
      ...options,
      locale,
      localization: resolvedLocalization,
      plugins
    }
  )

  const fieldsByName = new Map<string, AdditionalField>()
  for (const plugin of plugins) {
    for (const field of plugin.additionalFields ?? []) {
      fieldsByName.set(field.name, field)
    }
  }
  for (const field of mergedConfig.additionalFields ?? []) {
    fieldsByName.set(field.name, field)
  }
  mergedConfig.additionalFields = Array.from(fieldsByName.values())

  return { ...mergedConfig, authClient: options.authClient }
}
