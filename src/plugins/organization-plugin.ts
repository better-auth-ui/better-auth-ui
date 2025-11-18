import { createRoute, defineClientPlugin } from "@btst/stack/plugins/client"
import { lazy } from "react"
import { organizationViewPaths } from "../lib/view-paths"
import type { OrganizationOptions } from "../types/organization-options"
import type { AuthPluginOverrides } from "./auth-plugin"

/**
 * Configuration for organization client plugin
 */
export interface OrganizationClientConfig {
    siteBaseURL: string
    siteBasePath: string

    // Optional context to pass to loaders (for SSR)
    context?: Record<string, unknown>
}

/**
 * Plugin override interface for organization plugin
 * Extends AuthPluginOverrides with organization-specific options
 */
export interface OrganizationPluginOverrides
    extends Partial<AuthPluginOverrides> {
    /**
     * Organization plugin configuration
     * @default undefined
     */
    organization?: OrganizationOptions | boolean
    /**
     * Called when a route error occurs
     */
    onRouteError?: (
        routeName: string,
        error: Error,
        context: { path: string; isSSR: boolean }
    ) => void
}

// Meta generator factory for organization pages
function createAuthMeta(
    config: OrganizationClientConfig,
    path: string,
    title: string,
    description: string
) {
    return () => {
        const { siteBaseURL, siteBasePath } = config
        const fullUrl = `${siteBaseURL}${siteBasePath}${path}`

        return [
            { name: "title", content: title },
            { name: "description", content: description },
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "og:type", content: "website" },
            { property: "og:url", content: fullUrl },
            { name: "twitter:card", content: "summary" },
            { name: "twitter:title", content: title },
            { name: "twitter:description", content: description }
        ]
    }
}

/**
 * Organization client plugin
 * Provides routes, components, and meta for organization management flows
 *
 * @param config - Configuration including queryClient and URLs
 */
export const organizationClientPlugin = (config: OrganizationClientConfig) =>
    defineClientPlugin<OrganizationPluginOverrides>({
        name: "organization",
        routes: () => ({
            organizationSettings: createRoute(
                `/organization/${organizationViewPaths.SETTINGS}`,
                () => {
                    const OrganizationSettingsPage = lazy(() =>
                        import(
                            "../components/organization/pages/organization-settings-page"
                        ).then((m) => ({
                            default: m.OrganizationSettingsPage
                        }))
                    )

                    return {
                        PageComponent: OrganizationSettingsPage,
                        meta: createAuthMeta(
                            config,
                            `/organization/${organizationViewPaths.SETTINGS}`,
                            "Organization Settings",
                            "Manage your organization settings"
                        )
                    }
                }
            ),
            organizationMembers: createRoute(
                `/organization/${organizationViewPaths.MEMBERS}`,
                () => {
                    const OrganizationMembersPage = lazy(() =>
                        import(
                            "../components/organization/pages/organization-members-page"
                        ).then((m) => ({
                            default: m.OrganizationMembersPage
                        }))
                    )

                    return {
                        PageComponent: OrganizationMembersPage,
                        meta: createAuthMeta(
                            config,
                            `/organization/${organizationViewPaths.MEMBERS}`,
                            "Organization Members",
                            "Manage organization members"
                        )
                    }
                }
            ),
            organizationApiKeys: createRoute(
                `/organization/${organizationViewPaths.API_KEYS}`,
                () => {
                    const OrganizationApiKeysPage = lazy(() =>
                        import(
                            "../components/organization/pages/organization-api-keys-page"
                        ).then((m) => ({
                            default: m.OrganizationApiKeysPage
                        }))
                    )

                    return {
                        PageComponent: OrganizationApiKeysPage,
                        meta: createAuthMeta(
                            config,
                            `/organization/${organizationViewPaths.API_KEYS}`,
                            "Organization API Keys",
                            "Manage organization API keys"
                        )
                    }
                }
            )
        }),
        sitemap: async () => {
            return []
        }
    })
