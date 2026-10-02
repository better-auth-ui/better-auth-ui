import type {
  AdditionalField as AdditionalFieldConfig,
  AdditionalFieldValue
} from "@better-auth-ui/core"
import type {
  AuthButtonProps,
  AuthPlugin as AuthPluginPrimitive,
  UserMenuItemProps
} from "@better-auth-ui/react"
import type { ComponentType, ReactNode } from "react"
import type { SocialLayout } from "../components/auth/provider-buttons"
import type { CardVariant } from "../primitives/card"

/**
 * Props for the RN `<AdditionalField>` component and `field.render` callbacks.
 * Mirrors heroui's `AdditionalFieldProps` (`name`, `field`, `isPending`,
 * `variant`) but adds `onChange`: RN has no `FormData` to read a submitted
 * value from, so every additional-field renderer is a controlled component
 * that owns its local input state and reports parsed value changes back up
 * to the parent form (`SignUp`, `UserProfile`, …) via this callback.
 */
export type AdditionalFieldProps = {
  name: string
  field: AdditionalFieldConfig
  isPending?: boolean
  variant?: CardVariant
  onChange?: (value: AdditionalFieldValue | null) => void
}

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

/** RN card slot props — narrows the react base so cards accept `variant`. */
type CardSlotProps = SettingsViewProps & { children?: ReactNode }

/** RN plugin slot map (cards carry the RN `variant`, matching the hosts). */
export type AuthPluginComponents = {
  authButtons?: ComponentType<AuthButtonProps>[]
  captchaComponent?: ReactNode
  securityCards?: ComponentType<CardSlotProps>[]
  accountCards?: ComponentType<CardSlotProps>[]
  organizationCards?: ComponentType<CardSlotProps>[]
  userMenuItems?: ComponentType<UserMenuItemProps>[]
}

/**
 * The React Native `AuthPlugin` shape: the renderer-agnostic slot contract from
 * `@better-auth-ui/react`, bound to the RN view-prop + card-prop shapes. This is
 * what `useAuth().plugins` is typed as in the RN package.
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
