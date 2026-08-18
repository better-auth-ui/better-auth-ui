import { createAuthPlugin } from "../../lib/create-auth-plugin"
import {
  type ApiKeyExpirationOptions,
  resolveApiKeyExpirationOptions
} from "./api-key-expiration"
import {
  type ApiKeyLocalization,
  apiKeyLocalization
} from "./api-key-localization"

export type ApiKeyPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `ApiKeyLocalization`
   */
  localization?: Partial<ApiKeyLocalization>
  /**
   * Enable organization-owned API keys.
   *
   * When `true`, the plugin contributes an organization-scoped API keys card
   * to `<OrganizationSettings />`, and list/create/delete operations made on
   * behalf of an organization send `configId: "organization"`.
   *
   * Requires a matching server-side `apiKey` config entry with
   * `configId: "organization"` and `references: "organization"`:
   *
   * ```ts
   * apiKey([
   *   { configId: "default", references: "user" },
   *   { configId: "organization", references: "organization" }
   * ])
   * ```
   *
   * @default false
   */
  organization?: boolean
  /**
   * Configure the expiration choices shown when a user creates an API key.
   *
   * Set this to `false` to hide the expiration field and preserve the Better
   * Auth server default. Intervals are configured in days and sent to Better
   * Auth as seconds.
   *
   * @default { intervals: [30, 90], defaultInterval: 30, allowNever: true }
   */
  keyExpiration?: ApiKeyExpirationOptions | false
  /** API key configurations users can choose from. */
  configurations?: ApiKeyConfiguration[]
  /** Permission resources and actions rendered by create and edit forms. */
  permissions?: ApiKeyPermission[]
  /** Number of keys shown per page. @default 10 */
  pageSize?: number
}

export type ApiKeyConfiguration = {
  id: string
  label: string
  description?: string
  organization?: boolean
}

export type ApiKeyPermission = {
  resource: string
  label?: string
  actions: Array<string | { id: string; label: string }>
}

const resolvePageSize = (pageSize?: number) =>
  pageSize !== undefined && Number.isFinite(pageSize)
    ? Math.max(1, Math.floor(pageSize))
    : 10

export const apiKeyPlugin = createAuthPlugin(
  "apiKey",
  (options: ApiKeyPluginOptions = {}) => {
    const keyExpiration =
      options.keyExpiration === false
        ? false
        : resolveApiKeyExpirationOptions(options.keyExpiration)

    return {
      localization: { ...apiKeyLocalization, ...options.localization },
      organization: options.organization ?? false,
      keyExpiration,
      configurations: options.configurations ?? [],
      permissions: options.permissions ?? [],
      pageSize: resolvePageSize(options.pageSize)
    }
  }
)
