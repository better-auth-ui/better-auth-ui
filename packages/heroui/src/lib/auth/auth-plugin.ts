import type { AdditionalField as AdditionalFieldConfig } from "@better-auth-ui/core"
import type {
  AccountCardProps,
  AuthPlugin as AuthPluginPrimitive,
  AuthPluginComponents as BaseAuthPluginComponents,
  OrganizationCardProps,
  SecurityCardProps,
  UserMenuItemProps
} from "@better-auth-ui/react"
import type { CardProps } from "@heroui/react"
import type { ComponentType, ReactNode } from "react"

import type { SocialLayout } from "../../components/auth/provider-buttons"

/** Props for the heroui `<AdditionalField>` component and `field.render` callbacks. */
export type AdditionalFieldProps = {
  name: string
  field: AdditionalFieldConfig
  isPending?: boolean
  /** Complete suffix appended to labels for fields that are not required. */
  optionalLabel?: string
  variant?: CardProps["variant"]
}

// Lives here (rather than next to `<AdditionalField>`) so the augmentation
// is picked up by consumers who only import from `/plugins`.
declare module "@better-auth-ui/core" {
  interface AuthPluginRegister {
    heroui: AuthPlugin
  }

  interface AdditionalFieldRegister {
    label: ReactNode
    renderProps: AdditionalFieldProps
    renderResult: ReactNode
  }
}

/** Heroui slot component shapes — inherits from the framework-agnostic defaults and narrows slots that receive a heroui variant from the host. */
export type AuthPluginComponents = Omit<
  BaseAuthPluginComponents,
  "securityCards" | "accountCards" | "organizationCards"
> & {
  /** Rendered as cards inside security settings */
  securityCards?: ComponentType<
    SecurityCardProps & { variant?: CardProps["variant"] }
  >[]
  /** Rendered as cards inside account settings */
  accountCards?: ComponentType<
    AccountCardProps & { variant?: CardProps["variant"] }
  >[]
  /** Rendered as cards inside the active organization's settings */
  organizationCards?: ComponentType<
    OrganizationCardProps & { variant?: CardProps["variant"] }
  >[]
  /** Rendered as items inside the `UserButton` dropdown (e.g. account switcher). */
  userMenuItems?: ComponentType<UserMenuItemProps>[]
}

/** Props the heroui `<Auth>` router passes to plugin-contributed auth views. */
export type AuthViewProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/** Props the heroui `<Settings>` router spreads onto plugin-contributed settings views. */
export type SettingsViewProps = Omit<CardProps, "children">

/** Heroui plugin type. Plugin authors import this from `@better-auth-ui/heroui`. */
export type AuthPlugin = AuthPluginPrimitive<
  AuthPluginComponents,
  AuthViewProps,
  SettingsViewProps,
  AccountCardProps & { variant?: CardProps["variant"] }
>
