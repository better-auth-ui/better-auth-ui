import type { AdditionalFields } from "../config/additional-fields-config"

export type AuthPluginLocalizationContext = {
  direction: "ltr" | "rtl"
  languageTag: string
  localization: Record<string, unknown>
}

export type AuthPluginLocalizationResolver = (
  plugin: AuthPluginBase,
  context: AuthPluginLocalizationContext
) => AuthPluginBase

/**
 * View-path contributions kept on the plugin object.
 *
 * Plugins that add routable sub-pages (e.g. `magicLinkPlugin` adds
 * `/auth/magic-link`) declare the URL segment under the matching section.
 * Read at runtime via `useAuthPlugin(plugin).viewPaths.*`.
 *
 * Plugin-specific namespaces (e.g. organization route segments) are merged
 * via module augmentation from that plugin’s module — not declared here.
 */
export interface AuthPluginViewPaths {
  auth?: Record<string, string>
  settings?: Record<string, string>
}

/**
 * Core authentication plugin interface.
 *
 * Defines the identity, localization, and routing contributions every plugin
 * may ship. UI packages extend this with framework-specific slot components
 * (see `AuthPlugin` in `@better-auth-ui/react`).
 */
export interface AuthPluginBase {
  /** Unique identifier. Used as a React key and localization namespace. */
  id: string
  /** Localization defaults contributed by the plugin. */
  localization?: Record<string, unknown>
  /** @internal Consumer overrides retained so they win over locale messages. */
  _localizationOverrides?: Record<string, unknown>
  /** @internal Recomputes values derived from localization. */
  _localizationResolver?: AuthPluginLocalizationResolver
  /**
   * View-path segments the plugin contributes. Read by host components
   * (e.g. `<Auth>`, `MagicLinkButton`) via `useAuthPlugin(plugin).viewPaths`.
   */
  viewPaths?: AuthPluginViewPaths
  /**
   * Additional user fields contributed by the plugin. These are merged with
   * user-defined additionalFields in the auth config.
   */
  additionalFields?: AdditionalFields
}

/**
 * Composable module-augmentation slot for narrowing the plugin type returned
 * by `useAuth()`. Each augmentation registers under its own key so multiple
 * augmentations (e.g. a UI package and a user-land template) can coexist
 * without colliding on a single shared property.
 *
 * The resolved {@link AuthPlugin} type is the union of every registered
 * value, so `useAuth().plugins` is typed as the broadest plugin shape
 * across all augmentations a consumer has imported.
 *
 * Pick any unique string as the key — the key is only used to keep slots
 * disjoint during declaration merging and is never read at runtime.
 *
 * @example
 * declare module "@better-auth-ui/core" {
 *   interface AuthPluginRegister {
 *     // Use a key unique to your package or app, e.g. the package name.
 *     myUiPackage: MyAuthPlugin
 *   }
 * }
 */
// biome-ignore lint/suspicious/noEmptyInterface: declaration-merging slot
export interface AuthPluginRegister {}

/**
 * Resolved auth plugin type. Consumers widen this via keyed augmentations on
 * {@link AuthPluginRegister}; the resolved type is the union of every
 * registered value. With no augmentations it falls back to the
 * framework-agnostic {@link AuthPluginBase}.
 */
export type AuthPlugin = [keyof AuthPluginRegister] extends [never]
  ? AuthPluginBase
  : AuthPluginRegister[keyof AuthPluginRegister] extends infer P
    ? P extends AuthPluginBase
      ? P
      : AuthPluginBase
    : AuthPluginBase
