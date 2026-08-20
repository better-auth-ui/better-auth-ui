import { defaultAuthConfig } from "../../config"
import type { AdditionalFields } from "../../config/additional-fields-config"
import type { AvatarConfig } from "../../config/avatar-config"
import { createAuthPlugin } from "../../lib/create-auth-plugin"
import {
  type OrganizationLocalization,
  organizationLocalization
} from "./organization-localization"
import type { OrganizationViewPaths } from "./organization-view-paths"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` with the organization invitation path when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "accept-invitation" */
    acceptInvitation?: string
  }

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
   * - `auth.acceptInvitation` — segment for the direct invitation acceptance view (default `"accept-invitation"`).
   * - `settings.organizations` — segment for the organizations settings view (default `"organizations"`).
   * - `organization.settings` — segment for the `/organization/...` profile and danger zone tab (default `"settings"`).
   * - `organization.people` — segment for the `/organization/...` members and invitations tab (default `"people"`).
   * - `organization.teams` — segment for the `/organization/...` teams tab (default `"teams"`).
   * - `organization.roles` — segment for the dynamic roles tab (default `"roles"`).
   */
  viewPaths?: {
    auth?: {
      /** @default "accept-invitation" */
      acceptInvitation?: string
    }
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
  /**
   * Enable runtime organization roles and configure the permission editor.
   * The Better Auth client must also enable `dynamicAccessControl`.
   */
  dynamicAccessControl?: {
    /** @default true */
    enabled?: boolean
    /** Resources and actions available in the role permission matrix. */
    permissions: OrganizationPermissionRegistry
  }
  slug?: string | null
  /**
   * Prefix prepended to organization slugs.
   * @default ""
   */
  slugPrefix?: string
  /** Additional organization fields rendered during creation and profile editing. */
  additionalFields?: AdditionalFields
  /**
   * Additional fields grouped by the Better Auth organization model that
   * owns them. `organization` overrides the legacy `additionalFields` array.
   */
  modelFields?: OrganizationAdditionalFields
  /** Maximum organizations the current user can create. */
  organizationLimit?: number
  /** Maximum members per organization. */
  membershipLimit?: number
  /** Maximum pending invitations per organization. */
  invitationLimit?: number
  /** Whether organization creation controls are available. @default true */
  allowOrganizationCreation?: boolean
  /** Enable Better Auth team management controls. @default false */
  teams?: boolean
}

export type OrganizationAdditionalFields = {
  /** Fields rendered during organization creation and profile editing. */
  organization?: AdditionalFields
  /** Read-only member details returned by Better Auth member queries. */
  member?: AdditionalFields
  /** Fields rendered when an invitation is created. */
  invitation?: AdditionalFields
  /** Fields rendered when a team is created or edited. */
  team?: AdditionalFields
  /** Fields rendered when a dynamic organization role is created or edited. */
  role?: AdditionalFields
}

export type OrganizationPermissionResource = {
  /** Resource label shown above its actions. Defaults to the resource key. */
  label?: string
  /** Map of Better Auth action keys to display labels. */
  actions: Record<string, string>
}

export type OrganizationPermissionRegistry = Record<
  string,
  OrganizationPermissionResource
>

const resolvePolicyLimit = (limit?: number) =>
  limit !== undefined && Number.isSafeInteger(limit) && limit >= 0
    ? limit
    : undefined

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
      additionalFields:
        options.modelFields?.organization ?? options.additionalFields ?? [],
      modelFields: {
        organization:
          options.modelFields?.organization ?? options.additionalFields ?? [],
        member: options.modelFields?.member ?? [],
        invitation: options.modelFields?.invitation ?? [],
        team: options.modelFields?.team ?? [],
        role: options.modelFields?.role ?? []
      },
      dynamicAccessControl: options.dynamicAccessControl
        ? {
            enabled: options.dynamicAccessControl.enabled ?? true,
            permissions: options.dynamicAccessControl.permissions
          }
        : undefined,
      organizationLimit: resolvePolicyLimit(options.organizationLimit),
      membershipLimit: resolvePolicyLimit(options.membershipLimit),
      invitationLimit: resolvePolicyLimit(options.invitationLimit),
      allowOrganizationCreation: options.allowOrganizationCreation ?? true,
      teams: options.teams ?? false,
      viewPaths: {
        settings: {
          organizations:
            options.viewPaths?.settings?.organizations ?? "organizations"
        },
        auth: {
          acceptInvitation:
            options.viewPaths?.auth?.acceptInvitation ?? "accept-invitation"
        },
        organization: {
          settings: options.viewPaths?.organization?.settings ?? "settings",
          people: options.viewPaths?.organization?.people ?? "people",
          teams: options.viewPaths?.organization?.teams ?? "teams",
          roles: options.viewPaths?.organization?.roles ?? "roles"
        }
      }
    }
  }
)
