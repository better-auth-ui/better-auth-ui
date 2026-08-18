import type { SocialProvider } from "better-auth/social-providers"
import {
  type AuthSocialProvider,
  getProviderId,
  isCustomSocialProvider
} from "../config/social-provider-config"

/**
 * Mapping of social authentication provider identifiers to their human-readable display names.
 */
export const providerNames: Record<SocialProvider, string> = {
  apple: "Apple",
  atlassian: "Atlassian",
  cognito: "Cognito",
  discord: "Discord",
  dropbox: "Dropbox",
  facebook: "Facebook",
  figma: "Figma",
  github: "GitHub",
  gitlab: "GitLab",
  google: "Google",
  huggingface: "Hugging Face",
  kakao: "Kakao",
  kick: "Kick",
  line: "LINE",
  linear: "Linear",
  linkedin: "LinkedIn",
  microsoft: "Microsoft",
  naver: "Naver",
  notion: "Notion",
  paybin: "Paybin",
  paypal: "PayPal",
  polar: "Polar",
  railway: "Railway",
  reddit: "Reddit",
  roblox: "Roblox",
  salesforce: "Salesforce",
  slack: "Slack",
  spotify: "Spotify",
  tiktok: "TikTok",
  twitch: "Twitch",
  twitter: "X",
  vercel: "Vercel",
  vk: "VK",
  wechat: "WeChat",
  zoom: "Zoom"
}

/**
 * Get the human-readable display name for an authentication provider.
 *
 * @param provider - The provider identifier (e.g., "github", "google").
 * @returns The mapped display name for `provider` if available, otherwise `provider` with its first character capitalized.
 */
export function getProviderName(provider: AuthSocialProvider | string) {
  if (typeof provider !== "string" && isCustomSocialProvider(provider)) {
    return provider.label
  }

  const providerId =
    typeof provider === "string" ? provider : getProviderId(provider)
  return (
    providerNames[providerId as SocialProvider] ||
    providerId.charAt(0).toUpperCase() + providerId.slice(1)
  )
}
