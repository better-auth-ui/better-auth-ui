import type { SocialProvider } from "better-auth/social-providers"

/** Augmentation target for framework-specific provider icon values. */
// biome-ignore lint/suspicious/noEmptyInterface: augmentation target
export interface SocialProviderRegister {}

/** Icon value accepted by a configured provider. UI packages define this type. */
export type SocialProviderIcon = SocialProviderRegister extends {
  icon: infer TIcon
}
  ? TIcon
  : unknown

/** A custom provider displayed beside Better Auth's built-in social providers. */
export type CustomSocialProvider = {
  /** Provider ID configured in Better Auth. */
  id: string
  /** Human-readable provider name. */
  label: string
  /** Optional framework-specific icon. */
  icon?: SocialProviderIcon
}

/** Built-in provider ID or custom provider display configuration. */
export type AuthSocialProvider = SocialProvider | CustomSocialProvider

export const getProviderId = (provider: AuthSocialProvider | string) =>
  typeof provider === "string" ? provider : provider.id

export const isCustomSocialProvider = (
  provider: AuthSocialProvider
): provider is CustomSocialProvider => typeof provider !== "string"
