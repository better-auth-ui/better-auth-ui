import { createAuthPlugin } from "../../lib/create-auth-plugin"
// Side-effect import so this file participates in declaration merging on the
// same module instance that external consumers reach via `@better-auth-ui/core`.
import type {} from "../../lib/view-paths"
import {
  type OAuthProviderLocalization,
  oauthProviderLocalization
} from "./oauth-provider-localization"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` with the OAuth consent path when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "consent" */
    oauthConsent?: string
  }
}

export type OAuthScopeMetadata = {
  /** Short permission label displayed to the user. */
  label: string
  /** Optional explanation of the data or access represented by the scope. */
  description?: string
}

export type OAuthScopeMetadataMap = Record<string, OAuthScopeMetadata>

export const oauthProviderScopeMetadata: OAuthScopeMetadataMap = {
  openid: {
    label: "Verify your identity",
    description: "Access your unique account identifier."
  },
  profile: {
    label: "View your profile",
    description: "View your name and profile picture."
  },
  email: {
    label: "View your email address",
    description: "View your email address and whether it is verified."
  },
  offline_access: {
    label: "Maintain access",
    description:
      "Access your data when you are not actively using the application."
  }
}

export type OAuthAuthorizationRequest = {
  clientId?: string
  scopes: string[]
}

/**
 * Keep client-controlled links and images on browser-safe web protocols.
 */
export function sanitizeOAuthClientUrl(
  value: string | null | undefined
): string | undefined {
  if (!value) return undefined

  try {
    const url = new URL(value)

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Read the display-safe parts of Better Auth's signed authorization query.
 *
 * The complete query string must remain in the browser URL so
 * `oauthProviderClient()` can forward and verify it during consent.
 */
export function parseOAuthAuthorizationRequest(
  search: string
): OAuthAuthorizationRequest {
  const params = new URLSearchParams(search)
  const clientId = params.get("client_id")?.trim() || undefined
  const scopes = Array.from(
    new Set(
      (params.get("scope") ?? "")
        .split(/\s+/)
        .map((scope) => scope.trim())
        .filter(Boolean)
    )
  )

  return { clientId, scopes }
}

export type OAuthProviderPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `OAuthProviderLocalization`
   */
  localization?: Partial<OAuthProviderLocalization>
  /**
   * URL segment for the OAuth consent view.
   * @remarks `string`
   * @default "consent"
   */
  path?: string
  /**
   * Labels and descriptions for custom OAuth scopes.
   *
   * Entries override the built-in metadata for `openid`, `profile`, `email`,
   * and `offline_access`. Unknown scopes remain visible using their raw value.
   */
  scopeMetadata?: OAuthScopeMetadataMap
}

export const oauthProviderPlugin = createAuthPlugin(
  "oauthProvider",
  (options: OAuthProviderPluginOptions = {}) => ({
    localization: {
      ...oauthProviderLocalization,
      ...options.localization
    },
    scopeMetadata: {
      ...oauthProviderScopeMetadata,
      ...options.scopeMetadata
    },
    viewPaths: {
      auth: {
        oauthConsent: options.path ?? "consent"
      }
    }
  })
)
