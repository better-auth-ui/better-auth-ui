import { createRoute, defineClientPlugin } from "@btst/stack/plugins/client"
import { lazy } from "react"
import { accountViewPaths } from "../lib/view-paths"
import type { AccountOptions } from "../types/account-options"
import type { DeleteUserOptions } from "../types/delete-user-options"
import type { AuthPluginOverrides } from "./auth-plugin"

/**
 * Configuration for account client plugin
 */
export interface AccountClientConfig {
    siteBaseURL: string
    siteBasePath: string

    // Optional context to pass to loaders (for SSR)
    context?: Record<string, unknown>
}

/**
 * Plugin override interface for account plugin
 * Extends AuthPluginOverrides with account-specific options
 */
export interface AccountPluginOverrides extends Partial<AuthPluginOverrides> {
    /**
     * Enable account view & account configuration
     * @default { fields: ["image", "name"] }
     */
    account?: boolean | Partial<AccountOptions>
    /**
     * User Account deletion configuration
     * @default undefined
     */
    deleteUser?: DeleteUserOptions | boolean
    /**
     * Called when a route error occurs
     */
    onRouteError?: (
        routeName: string,
        error: Error,
        context: { path: string; isSSR: boolean }
    ) => void
}

// Meta generator factory for account pages
function createAuthMeta(
    config: AccountClientConfig,
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
 * Account client plugin
 * Provides routes, components, and meta for account management flows
 *
 * @param config - Configuration including queryClient and URLs
 */
export const accountClientPlugin = (config: AccountClientConfig) =>
    defineClientPlugin<AccountPluginOverrides>({
        name: "account",
        routes: () => ({
            // Account views
            accountSettings: createRoute(
                `/account/${accountViewPaths.SETTINGS}`,
                () => {
                    const AccountSettingsPage = lazy(() =>
                        import(
                            "../components/account/pages/account-settings-page"
                        ).then((m) => ({
                            default: m.AccountSettingsPage
                        }))
                    )

                    return {
                        PageComponent: AccountSettingsPage,
                        meta: createAuthMeta(
                            config,
                            `/account/${accountViewPaths.SETTINGS}`,
                            "Account Settings",
                            "Manage your account settings"
                        )
                    }
                }
            ),
            accountSecurity: createRoute(
                `/account/${accountViewPaths.SECURITY}`,
                () => {
                    const AccountSecurityPage = lazy(() =>
                        import(
                            "../components/account/pages/account-security-page"
                        ).then((m) => ({
                            default: m.AccountSecurityPage
                        }))
                    )

                    return {
                        PageComponent: AccountSecurityPage,
                        meta: createAuthMeta(
                            config,
                            `/account/${accountViewPaths.SECURITY}`,
                            "Security",
                            "Manage your security settings"
                        )
                    }
                }
            ),
            accountApiKeys: createRoute(
                `/account/${accountViewPaths.API_KEYS}`,
                () => {
                    const AccountApiKeysPage = lazy(() =>
                        import(
                            "../components/account/pages/account-api-keys-page"
                        ).then((m) => ({
                            default: m.AccountApiKeysPage
                        }))
                    )

                    return {
                        PageComponent: AccountApiKeysPage,
                        meta: createAuthMeta(
                            config,
                            `/account/${accountViewPaths.API_KEYS}`,
                            "API Keys",
                            "Manage your API keys"
                        )
                    }
                }
            ),
            accountOrganizations: createRoute(
                `/account/${accountViewPaths.ORGANIZATIONS}`,
                () => {
                    const AccountOrganizationsPage = lazy(() =>
                        import(
                            "../components/account/pages/account-organizations-page"
                        ).then((m) => ({
                            default: m.AccountOrganizationsPage
                        }))
                    )

                    return {
                        PageComponent: AccountOrganizationsPage,
                        meta: createAuthMeta(
                            config,
                            `/account/${accountViewPaths.ORGANIZATIONS}`,
                            "Organizations",
                            "Manage your organizations"
                        )
                    }
                }
            )
        }),
        sitemap: async () => {
            return []
        }
    })
