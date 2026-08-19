import type { AuthSocialProvider } from "@better-auth-ui/core"
import type { SocialProvider } from "better-auth/social-providers"
import {
  type ComponentPropsWithRef,
  type ComponentType,
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement
} from "react"
import {
  Apple,
  Atlassian,
  Cognito,
  Discord,
  Dropbox,
  Facebook,
  Figma,
  GitHub,
  GitLab,
  Google,
  HuggingFace,
  Kakao,
  Kick,
  Line,
  Linear,
  LinkedIn,
  Microsoft,
  Naver,
  Notion,
  Paybin,
  PayPal,
  Polar,
  Railway,
  Reddit,
  Roblox,
  Salesforce,
  Slack,
  Spotify,
  TikTok,
  Twitch,
  Vercel,
  VK,
  WeChat,
  X,
  Zoom
} from "../components/icons"

/**
 * Mapping of social authentication provider names to their corresponding icon components.
 *
 * Provides React SVG icon components for all supported social authentication providers.
 * Each icon is a React component that accepts standard SVG props and can be customized
 * with className, size, color, etc.
 *
 * Supported providers include: Apple, Google, GitHub, Microsoft, Discord, Facebook,
 * Twitter/X, and many others.
 */
export const providerIcons: Record<
  SocialProvider,
  ComponentType<ComponentPropsWithRef<"svg">>
> = {
  apple: Apple,
  atlassian: Atlassian,
  cognito: Cognito,
  discord: Discord,
  dropbox: Dropbox,
  facebook: Facebook,
  figma: Figma,
  github: GitHub,
  gitlab: GitLab,
  google: Google,
  huggingface: HuggingFace,
  kakao: Kakao,
  kick: Kick,
  line: Line,
  linear: Linear,
  linkedin: LinkedIn,
  microsoft: Microsoft,
  naver: Naver,
  notion: Notion,
  paybin: Paybin,
  paypal: PayPal,
  polar: Polar,
  railway: Railway,
  reddit: Reddit,
  roblox: Roblox,
  salesforce: Salesforce,
  slack: Slack,
  spotify: Spotify,
  tiktok: TikTok,
  twitch: Twitch,
  twitter: X,
  vercel: Vercel,
  vk: VK,
  wechat: WeChat,
  zoom: Zoom
}

/** Resolve a built-in icon component or a custom provider's configured icon. */
export const getProviderIcon = (provider: AuthSocialProvider | string) =>
  typeof provider === "string"
    ? providerIcons[provider as SocialProvider]
    : provider.icon

/** Render a built-in provider icon or return a custom configured icon node. */
export const renderProviderIcon = (
  provider: AuthSocialProvider | string,
  props?: ComponentPropsWithRef<"svg">
) => {
  if (typeof provider !== "string") {
    if (!isValidElement(provider.icon)) return provider.icon ?? null

    const icon = provider.icon as ReactElement<ComponentPropsWithRef<"svg">>
    const className = [icon.props.className, props?.className]
      .filter(Boolean)
      .join(" ")

    return cloneElement(icon, {
      ...props,
      className: className || undefined
    })
  }
  const ProviderIcon = providerIcons[provider as SocialProvider]
  return ProviderIcon ? createElement(ProviderIcon, props) : null
}
