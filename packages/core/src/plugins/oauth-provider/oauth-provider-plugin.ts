import { createAuthPlugin } from "../../lib/create-auth-plugin"
// Side-effect import so this file participates in declaration merging on the
// same module instance that external consumers reach via `@better-auth-ui/core`.
import type {} from "../../lib/view-paths"
import type { OAuthClientManager } from "./oauth-client-manager"
import {
  type OAuthProviderLocalization,
  oauthProviderLocalization
} from "./oauth-provider-localization"
import type { OAuthScopeMetadataSource } from "./oauth-scope-metadata"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` with the OAuth paths when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "oauth-consent" */
    oauthConsent?: string
    /** @default "oauth-sign-up" */
    oauthSignUp?: string
    /** @default "select-account" */
    oauthSelectAccount?: string
  }

  interface SettingsViewPaths {
    /** @default "oauth-clients" */
    oauthClients?: string
  }
}

/**
 * The display-safe parts of Better Auth's signed authorization query.
 */
export type OAuthAuthorizationRequest = {
  clientId?: string
  scopes: string[]
  prompts: string[]
}

/**
 * Variables accepted by Better Auth's `oauth2.continue` endpoint.
 *
 * Exactly one flag is set per call, matching the redirect screen that just
 * finished: signup (`created`), account selection (`selected`), or an
 * application-owned post-login screen (`postLogin`).
 */
export interface OAuthContinueVariables {
  created?: true
  selected?: true
  postLogin?: true
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

const splitSpaceDelimited = (value: string | null) =>
  Array.from(
    new Set(
      (value ?? "")
        .split(/\s+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
  )

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

  return {
    clientId,
    scopes: splitSpaceDelimited(params.get("scope")),
    prompts: splitSpaceDelimited(params.get("prompt"))
  }
}

/**
 * Check whether the authorization request asked for a specific prompt.
 *
 * OAuth sends `prompt` as a space-separated set, so `prompt=login consent`
 * matches both `"login"` and `"consent"`.
 */
export function hasOAuthPrompt(
  request: OAuthAuthorizationRequest,
  prompt: string
): boolean {
  return request.prompts.includes(prompt)
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
   * @default "oauth-consent"
   */
  path?: string
  /**
   * URL segment for the OAuth-aware sign-up view.
   *
   * This is a route of its own rather than an override of the built-in
   * `signUp` view, so ordinary sign-up stays untouched. Point Better Auth's
   * `signup.page` at it.
   * @remarks `string`
   * @default "oauth-sign-up"
   */
  signUpPath?: string
  /**
   * URL segment for the OAuth account selection view.
   * @remarks `string`
   * @default "select-account"
   */
  selectAccountPath?: string
  /**
   * Labels and descriptions for OAuth scopes, as a keyed record, a static
   * list, or a synchronous resolver.
   *
   * Entries override the built-in metadata for `openid`, `profile`, `email`,
   * and `offline_access`. Unresolved scopes remain visible using their raw
   * value.
   * @remarks `OAuthScopeMetadataSource`
   */
  scopeMetadata?: OAuthScopeMetadataSource
  /**
   * Register the connected applications card in security settings.
   * @remarks `boolean`
   * @default true
   */
  showConnectedApplications?: boolean
  /**
   * Add personal OAuth client developer settings backed by Better Auth.
   * @default false
   */
  clientManagement?: boolean
  /**
   * Replace the personal Better Auth browser adapter with an application-owned
   * manager. Use this for server-only operations such as enable or disable.
   */
  clientManager?: OAuthClientManager
  /**
   * Add organization developer settings backed by an application-owned
   * manager. The UI passes the organization ID and slug on every operation.
   */
  organizationClientManager?: OAuthClientManager
  /** @default "oauth-clients" */
  clientManagementPath?: string
}

export const oauthProviderPlugin = createAuthPlugin(
  "oauthProvider",
  (options: OAuthProviderPluginOptions = {}) => ({
    localization: {
      ...oauthProviderLocalization,
      ...options.localization
    },
    scopeMetadata: options.scopeMetadata,
    showConnectedApplications: options.showConnectedApplications ?? true,
    clientManagement:
      options.clientManagement ?? Boolean(options.clientManager),
    clientManager: options.clientManager,
    organizationClientManager: options.organizationClientManager,
    viewPaths: {
      auth: {
        oauthConsent: options.path ?? "oauth-consent",
        oauthSignUp: options.signUpPath ?? "oauth-sign-up",
        oauthSelectAccount: options.selectAccountPath ?? "select-account"
      },
      settings: {
        oauthClients: options.clientManagementPath ?? "oauth-clients"
      }
    }
  })
)
