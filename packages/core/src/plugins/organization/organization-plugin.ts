import { defaultAuthConfig } from "../../config"
import type { AvatarConfig } from "../../config/avatar-config"
import { createAuthPlugin } from "../../lib/create-auth-plugin"
import {
  type OrganizationLocalization,
  organizationLocalization
} from "./organization-localization"
import type { OrganizationViewPaths } from "./organization-view-paths"

declare module "../../lib/view-paths" {
  /** Widens `SettingsViewPaths` by adding the `"organizations"` path when this plugin is imported. */
  interface SettingsViewPaths {
    /** @default "organizations" */
    organizations?: string
  }
}

declare module "../../lib/auth-plugin" {
  interface AuthPluginViewPaths {
    organization?: Partial<OrganizationViewPaths>
  }
}

export type OrganizationPluginOptions = {
  /**
   * Whether to call `organization.checkSlug` when entering an organization slug.
   * @default true
   */
  checkSlug?: boolean
  /**
   * Override the plugin's default localization strings.
   * @remarks `OrganizationLocalization`
   */
  localization?: Partial<OrganizationLocalization>
  /**
   * Override URL segments contributed by this plugin.
   *
   * - `settings.organizations` — segment for the organizations settings view (default `"organizations"`).
   * - `organization.settings` — segment for the `/organization/...` profile and danger zone tab (default `"settings"`).
   * - `organization.people` — segment for the `/organization/...` members and invitations tab (default `"people"`).
   */
  viewPaths?: {
    settings?: {
      /** @default "organizations" */
      organizations?: string
    }
    organization?: Partial<OrganizationViewPaths>
  }
  /**
   * Organization logo upload, optimization, and deletion configuration.
   * Same shape as {@link AvatarConfig} used for user avatars (`AuthConfig.avatar`).
   * @remarks `AvatarConfig`
   * @default { enabled: true, resize: resizeAvatar, size: 256, extension: "png" }
   */
  logo?: Partial<AvatarConfig>
  /**
   * Map of role keys to display labels. When omitted, defaults to localized
   * labels for `owner`, `admin`, and `member` (from `localization.owner`
   * etc.) plus {@link OrganizationPluginOptions.additionalRoles}. When set,
   * replaces that default map entirely; use {@link OrganizationPluginOptions.additionalRoles}
   * to add more labels on top. Looked up at render time via `roles?.[role]`.
   * @remarks `Record<string, string>`
   */
  roles?: Record<string, string>
  /**
   * Extra role labels merged after the effective role map (either
   * {@link OrganizationPluginOptions.roles} when provided, or the localized
   * defaults). Use this for custom server roles without redefining built-in
   * labels.
   * @remarks `Record<string, string>`
   */
  additionalRoles?: Record<string, string>
  slug?: string | null
  /**
   * Prefix prepended to organization slugs.
   * @default ""
   */
  slugPrefix?: string
}

export const organizationPlugin = createAuthPlugin(
  "organization",
  (options: OrganizationPluginOptions = {}) => {
    const localization = {
      ...organizationLocalization,
      ...options.localization
    }

    return {
      slug: options.slug,
      slugPrefix: options.slugPrefix ?? "",
      checkSlug: options.checkSlug ?? true,
      localization,
      logo: {
        ...defaultAuthConfig.avatar,
        ...options.logo
      },
      roles: {
        ...(options.roles ?? {
          owner: localization.owner,
          admin: localization.admin,
          member: localization.member
        }),
        ...options.additionalRoles
      },
      viewPaths: {
        settings: {
          organizations:
            options.viewPaths?.settings?.organizations ?? "organizations"
        },
        organization: {
          settings: options.viewPaths?.organization?.settings ?? "settings",
          people: options.viewPaths?.organization?.people ?? "people"
        }
      }
    }
  }
)
