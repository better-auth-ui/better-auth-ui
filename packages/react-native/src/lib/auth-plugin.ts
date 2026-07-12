import type {
  AuthPluginComponents,
  AuthPlugin as AuthPluginPrimitive
} from "@better-auth-ui/react"
import type { SocialLayout } from "../components/auth/provider-buttons"
import type { CardVariant } from "../primitives/card"

/**
 * Props the RN `<Auth>` router spreads onto plugin-provided auth views
 * (e.g. magic-link, username sign-in). Mirrors heroui's `AuthViewProps` but
 * carries `token` (RN has no `window.location` for deep-link tokens) and uses
 * the RN `CardVariant`.
 */
export type AuthViewProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardVariant
  /** Deep-link token for token-bearing plugin views. */
  token?: string
}

/** Props for plugin-provided settings views / cards. */
export type SettingsViewProps = {
  className?: string
  variant?: CardVariant
}

/**
 * The React Native `AuthPlugin` shape: the renderer-agnostic slot contract from
 * `@better-auth-ui/react`, bound to the RN view-prop shapes. This is what
 * `useAuth().plugins` is typed as in the RN package.
 */
export type AuthPlugin = AuthPluginPrimitive<
  AuthPluginComponents,
  AuthViewProps,
  SettingsViewProps
>

// Widen the resolved `AuthPlugin` (core declaration-merging slot) so
// `useAuth().plugins` carries the RN slot shapes + view props. Lives here (a
// module the root barrel re-exports) so every consumer sees the widening.
declare module "@better-auth-ui/core" {
  interface AuthPluginRegister {
    reactNative: AuthPlugin
  }
}
