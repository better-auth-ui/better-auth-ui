import type { AuthPluginBase, AuthView } from "@better-auth-ui/core"
import type { ComponentType, ReactNode } from "react"
import type { SettingsTab } from "./settings-tab"

const authButtonIds = new WeakMap<ComponentType<AuthButtonProps>, number>()
let nextAuthButtonId = 1
const organizationCardIds = new WeakMap<object, number>()
let nextOrganizationCardId = 1

export type { AuthPluginViewPaths } from "@better-auth-ui/core"

/** Props for plugin-contributed auth buttons (e.g. passkey, magic link). */
export type AuthButtonProps = {
  /** Whether the button can own a browser autofill request. */
  autoFill?: boolean
  className?: string
  children?: ReactNode
  /** Current auth view — lets buttons context-switch (e.g. show "back to sign-in"). */
  view?: AuthView
}

/** Return a stable React key for a plugin-contributed auth button component. */
export function getAuthButtonKey(
  pluginId: string,
  AuthButton: ComponentType<AuthButtonProps>
) {
  let buttonId = authButtonIds.get(AuthButton)

  if (buttonId === undefined) {
    buttonId = nextAuthButtonId
    nextAuthButtonId += 1
    authButtonIds.set(AuthButton, buttonId)
  }

  return `${pluginId}-${buttonId.toString()}`
}

/** Return a stable React key for a plugin-contributed organization card. */
export function getOrganizationCardKey<TProps>(
  pluginId: string,
  OrganizationCard: ComponentType<TProps>
) {
  let cardId = organizationCardIds.get(OrganizationCard)

  if (cardId === undefined) {
    cardId = nextOrganizationCardId
    nextOrganizationCardId += 1
    organizationCardIds.set(OrganizationCard, cardId)
  }

  return `${pluginId}-${cardId.toString()}`
}

/** Props for plugin-contributed headless authentication prompts. */
export type AuthPromptProps = {
  /** Current auth view. */
  view: AuthView
}

/** A keyed headless prompt contributed to authentication views. */
export type AuthPrompt = {
  /** Stable identity within the owning plugin. */
  id: string
  component: ComponentType<AuthPromptProps>
}

/** Props for plugin-contributed cards under `/settings/security`. */
export type SecurityCardProps = {
  className?: string
  children?: ReactNode
}

/** Props for plugin-contributed cards under `/settings/account`. */
export type AccountCardProps = {
  className?: string
  children?: ReactNode
}

/** Props for plugin-contributed cards under `/organization/...` settings. */
export type OrganizationCardProps = {
  className?: string
  children?: ReactNode
  organizationId: string
  organizationSlug: string
}

export type OrganizationTabProps = {
  organizationId: string
  organizationSlug: string
}

export type OrganizationTab = {
  id: string
  path: string
  label: ReactNode
  component: ComponentType<OrganizationTabProps>
}

/** A finite static view contributed to the administration shell. */
export type AdminTab = {
  id: string
  path: string
  label: ReactNode
  component: ComponentType
}

export type AdminUserTabProps = {
  userId: string
}

/** A tab contributed to the admin user inspector. */
export type AdminUserTab = {
  id: string
  label: ReactNode
  component: ComponentType<AdminUserTabProps>
}

/** Props for plugin-contributed items in the `UserButton` dropdown. */
export type UserMenuItemProps = {
  className?: string
  /** When true, the subtitle line (email when name/username is shown) is hidden. */
  hideSubtitle?: boolean
}

/** Framework-agnostic slot component shapes. UI packages narrow these via `TComponents`. */
export type AuthPluginComponents = {
  /** Rendered below the submit button in auth forms. */
  authButtons?: ComponentType<AuthButtonProps>[]
  /** Headless prompts mounted by authentication views. */
  authPrompts?: AuthPrompt[]
  /** Captcha widget rendered above the submit button, below additionalFields. Singular — only one captcha can be active at a time. */
  captchaComponent?: ReactNode
  /** Rendered as cards inside security settings. */
  securityCards?: ComponentType<SecurityCardProps>[]
  /** Rendered as cards inside account settings. */
  accountCards?: ComponentType<AccountCardProps>[]
  /** Rendered as cards inside the active organization's settings. */
  organizationCards?: ComponentType<OrganizationCardProps>[]
  /** Rendered as items inside the `UserButton` dropdown. */
  userMenuItems?: ComponentType<UserMenuItemProps>[]
}

/** Plugin view overrides keyed by `AuthPluginViewPaths`. Always replaces the built-in view. */
export type AuthPluginViews<TAuthViewProps, TSettingsViewProps> = {
  auth?: Record<string, ComponentType<TAuthViewProps>>
  settings?: Record<string, ComponentType<TSettingsViewProps>>
}

/** Conditional view replacements — only used when the built-in flow isn't viable. */
export type AuthPluginFallbackViews<TAuthViewProps> = {
  auth?: {
    /** Rendered at `/auth/sign-in` when `emailAndPassword.enabled === false`. */
    signIn?: ComponentType<TAuthViewProps>
  }
}

/**
 * Built-in settings cards a plugin replaces outright.
 *
 * `accountCards` and `securityCards` are additive, which isn't enough for
 * flows that change how an existing card works — e.g. the email-OTP plugin
 * swaps the link-based change-email card for its code-based one. First plugin
 * declaring an override wins, matching how `views` resolve in `<Auth>`.
 */
export type AuthPluginCardOverrides<TAccountCardProps = AccountCardProps> = {
  account?: {
    /** Replaces the built-in `<ChangeEmail />` card. */
    changeEmail?: ComponentType<TAccountCardProps>
  }
}

/**
 * UI-aware plugin definition. UI packages bind the generics in their own
 * `AuthPlugin` re-export so plugin authors don't have to.
 *
 * @typeParam TComponents - Slot component shapes (e.g. heroui variant unions).
 * @typeParam TAuthViewProps - Props the `<Auth>` router spreads onto plugin auth views.
 * @typeParam TSettingsViewProps - Props the `<Settings>` router spreads onto plugin settings views.
 * @typeParam TAccountCardProps - Props account-settings cards receive from the host.
 */
export type AuthPlugin<
  TComponents = AuthPluginComponents,
  // biome-ignore lint/suspicious/noExplicitAny: any
  TAuthViewProps = any,
  // biome-ignore lint/suspicious/noExplicitAny: any
  TSettingsViewProps = any,
  TAccountCardProps = AccountCardProps
> = AuthPluginBase &
  TComponents & {
    views?: AuthPluginViews<TAuthViewProps, TSettingsViewProps>
    fallbackViews?: AuthPluginFallbackViews<TAuthViewProps>
    /** Built-in settings cards this plugin replaces. See {@link AuthPluginCardOverrides}. */
    cardOverrides?: AuthPluginCardOverrides<TAccountCardProps>
    /**
     * Tabs the plugin contributes to the settings page. Each entry is a
     * {@link SettingsTab} (`view`, `label`, `component`). Read at runtime via
     * `useAuthPlugin(plugin).settingsTabs`.
     */
    settingsTabs?: SettingsTab[]
    /** First-class static views contributed to the administration shell. */
    adminTabs?: AdminTab[]
    /** Tabs contributed to the administration user inspector. */
    adminUserTabs?: AdminUserTab[]
    /** First-class organization settings tabs contributed by the plugin. */
    organizationTabs?: OrganizationTab[]
  }
