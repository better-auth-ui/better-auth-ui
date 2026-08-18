import type { AuthPluginBase, AuthView } from "@better-auth-ui/core"
import type { Component } from "solid-js"

export type OrganizationTabProps = {
  organizationId: string
  organizationSlug: string
}

export type OrganizationTab = {
  id: string
  path: string
  label: Component
  component: Component<OrganizationTabProps>
}

export type CaptchaComponent = Component

export type AuthPromptProps = {
  view: AuthView
}

export type AuthPrompt = {
  id: string
  component: Component<AuthPromptProps>
}

export type SolidAuthPlugin = AuthPluginBase & {
  /** Headless prompts mounted by authentication views. */
  authPrompts?: AuthPrompt[]
  /** Captcha widget rendered above submit buttons in auth forms. */
  captchaComponent?: CaptchaComponent
  /** First-class organization settings tabs contributed by the plugin. */
  organizationTabs?: OrganizationTab[]
  /** Allow app-owned copied components to add Solid-specific plugin slots. */
  [key: string]: unknown
}

declare module "@better-auth-ui/core" {
  interface AuthPluginRegister {
    solid: SolidAuthPlugin
  }
}

export type { AuthPluginViewPaths } from "@better-auth-ui/core"
export type AuthPlugin = SolidAuthPlugin
