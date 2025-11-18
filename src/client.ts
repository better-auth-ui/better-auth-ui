import { createRoute, defineClientPlugin } from "@btst/stack/plugins/client"
import { lazy } from "react"
import {
    accountViewPaths,
    authViewPaths,
    organizationViewPaths
} from "./lib/view-paths"

/**
 * Configuration for auth client plugin
 */
export interface AuthClientConfig {
    siteBaseURL: string
    siteBasePath: string

    // Optional context to pass to loaders (for SSR)
    context?: Record<string, unknown>
}

// Meta generator factory for auth pages
function createAuthMeta(
    config: AuthClientConfig,
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
 * Auth client plugin
 * Provides routes, components, and meta for authentication flows
 *
 * @param config - Configuration including queryClient and URLs
 */
export const authClientPlugin = (
    config: AuthClientConfig
) =>
    defineClientPlugin({
        name: "auth",
        routes: () => ({
            signIn: createRoute(`/auth/${authViewPaths.SIGN_IN}`, () => {
                const AuthView = lazy(() =>
                    import("./components/auth/auth-view").then((m) => ({
                        default: m.AuthView
                    }))
                )

                return {
                    PageComponent: AuthView,
                    meta: createAuthMeta(
                        config,
                        `/auth/${authViewPaths.SIGN_IN}`,
                        "Sign In",
                        "Sign in to your account"
                    )
                }
            }),
            signUp: createRoute(`/auth/${authViewPaths.SIGN_UP}`, () => {
                const AuthView = lazy(() =>
                    import("./components/auth/auth-view").then((m) => ({
                        default: m.AuthView
                    }))
                )

                return {
                    PageComponent: AuthView,
                    meta: createAuthMeta(
                        config,
                        `/auth/${authViewPaths.SIGN_UP}`,
                        "Sign Up",
                        "Create a new account"
                    )
                }
            }),
            forgotPassword: createRoute(
                `/auth/${authViewPaths.FORGOT_PASSWORD}`,
                () => {
                    const AuthView = lazy(() =>
                        import("./components/auth/auth-view").then((m) => ({
                            default: m.AuthView
                        }))
                    )

                    return {
                        PageComponent: AuthView,
                        meta: createAuthMeta(
                            config,
                            `/auth/${authViewPaths.FORGOT_PASSWORD}`,
                            "Forgot Password",
                            "Reset your password"
                        )
                    }
                }
            ),
            resetPassword: createRoute(
                `/auth/${authViewPaths.RESET_PASSWORD}`,
                () => {
                    const AuthView = lazy(() =>
                        import("./components/auth/auth-view").then((m) => ({
                            default: m.AuthView
                        }))
                    )

                    return {
                        PageComponent: AuthView,
                        meta: createAuthMeta(
                            config,
                            `/auth/${authViewPaths.RESET_PASSWORD}`,
                            "Reset Password",
                            "Enter your new password"
                        )
                    }
                }
            ),
            magicLink: createRoute(`/auth/${authViewPaths.MAGIC_LINK}`, () => {
                const AuthView = lazy(() =>
                    import("./components/auth/auth-view").then((m) => ({
                        default: m.AuthView
                    }))
                )

                return {
                    PageComponent: AuthView,
                    meta: createAuthMeta(
                        config,
                        `/auth/${authViewPaths.MAGIC_LINK}`,
                        "Magic Link",
                        "Sign in with magic link"
                    )
                }
            }),
            emailOtp: createRoute(`/auth/${authViewPaths.EMAIL_OTP}`, () => {
                const AuthView = lazy(() =>
                    import("./components/auth/auth-view").then((m) => ({
                        default: m.AuthView
                    }))
                )

                return {
                    PageComponent: AuthView,
                    meta: createAuthMeta(
                        config,
                        `/auth/${authViewPaths.EMAIL_OTP}`,
                        "Email Code",
                        "Sign in with email code"
                    )
                }
            }),
            twoFactor: createRoute(`/auth/${authViewPaths.TWO_FACTOR}`, () => {
                const AuthView = lazy(() =>
                    import("./components/auth/auth-view").then((m) => ({
                        default: m.AuthView
                    }))
                )

                return {
                    PageComponent: AuthView,
                    meta: createAuthMeta(
                        config,
                        `/auth/${authViewPaths.TWO_FACTOR}`,
                        "Two-Factor Authentication",
                        "Enter your verification code"
                    )
                }
            }),
            recoverAccount: createRoute(
                `/auth/${authViewPaths.RECOVER_ACCOUNT}`,
                () => {
                    const AuthView = lazy(() =>
                        import("./components/auth/auth-view").then((m) => ({
                            default: m.AuthView
                        }))
                    )

                    return {
                        PageComponent: AuthView,
                        meta: createAuthMeta(
                            config,
                            `/auth/${authViewPaths.RECOVER_ACCOUNT}`,
                            "Recover Account",
                            "Recover your account with a backup code"
                        )
                    }
                }
            ),
            callback: createRoute(`/auth/${authViewPaths.CALLBACK}`, () => {
                const AuthCallback = lazy(() =>
                    import("./components/auth/auth-callback").then((m) => ({
                        default: m.AuthCallback
                    }))
                )

                return {
                    PageComponent: AuthCallback
                }
            }),
            signOut: createRoute(`/auth/${authViewPaths.SIGN_OUT}`, () => {
                const SignOut = lazy(() =>
                    import("./components/auth/sign-out").then((m) => ({
                        default: m.SignOut
                    }))
                )

                return {
                    PageComponent: SignOut
                }
            }),
            acceptInvitation: createRoute(
                `/auth/${authViewPaths.ACCEPT_INVITATION}`,
                () => {
                    const AcceptInvitationCard = lazy(() =>
                        import(
                            "./components/organization/accept-invitation-card"
                        ).then((m) => ({
                            default: m.AcceptInvitationCard
                        }))
                    )

                    return {
                        PageComponent: AcceptInvitationCard
                    }
                }
            ),
        }),
        sitemap: async () => {
            // Only include public-facing auth pages in sitemap
            return [
                {
                    url: `${config.siteBaseURL}${config.siteBasePath}/${authViewPaths.SIGN_IN}`,
                    lastModified: new Date(),
                    priority: 0.8
                },
                {
                    url: `${config.siteBaseURL}${config.siteBasePath}/${authViewPaths.SIGN_UP}`,
                    lastModified: new Date(),
                    priority: 0.8
                },
                {
                    url: `${config.siteBaseURL}${config.siteBasePath}/${authViewPaths.FORGOT_PASSWORD}`,
                    lastModified: new Date(),
                    priority: 0.5
                }
            ]
        }
    })

/**
 * Auth client plugin
 * Provides routes, components, and meta for authentication flows
 *
 * @param config - Configuration including queryClient and URLs
 */
export const accountClientPlugin = (
    config: AuthClientConfig
) =>
    defineClientPlugin({
        name: "account",
        routes: () => ({
            
            // Account views
            accountSettings: createRoute(
                `/account/${accountViewPaths.SETTINGS}`,
                () => {
                    const AccountView = lazy(() =>
                        import("./components/account/account-view").then(
                            (m) => ({
                                default: m.AccountView
                            })
                        )
                    )

                    return {
                        PageComponent: AccountView,
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
                    const AccountView = lazy(() =>
                        import("./components/account/account-view").then(
                            (m) => ({
                                default: m.AccountView
                            })
                        )
                    )

                    return {
                        PageComponent: AccountView,
                        meta: createAuthMeta(
                            config,
                            `/account/${accountViewPaths.SECURITY}`,
                            "Security",
                            "Manage your security settings"
                        )
                    }
                }
            ),
            accountApiKeys: createRoute(`/account/${accountViewPaths.API_KEYS}`, () => {
                const AccountView = lazy(() =>
                    import("./components/account/account-view").then((m) => ({
                        default: m.AccountView
                    }))
                )

                return {
                    PageComponent: AccountView,
                    meta: createAuthMeta(
                        config,
                        `/account/${accountViewPaths.API_KEYS}`,
                        "API Keys",
                        "Manage your API keys"
                    )
                }
            }),
            accountOrganizations: createRoute(
                `/account/${accountViewPaths.ORGANIZATIONS}`,
                () => {
                    const AccountView = lazy(() =>
                        import("./components/account/account-view").then(
                            (m) => ({
                                default: m.AccountView
                            })
                        )
                    )

                    return {
                        PageComponent: AccountView,
                        meta: createAuthMeta(
                            config,
                            `/account/${accountViewPaths.ORGANIZATIONS}`,
                            "Organizations",
                            "Manage your organizations"
                        )
                    }
                }
            ),
            
        }),
        sitemap: async () => {
            return []
        }
    })

/**
 * Auth client plugin
 * Provides routes, components, and meta for authentication flows
 *
 * @param config - Configuration including queryClient and URLs
 */
export const organizationClientPlugin = (
    config: AuthClientConfig
) =>
    defineClientPlugin({
        name: "organization",
        routes: () => ({
            organizationSettings: createRoute(
                `/organization/${organizationViewPaths.SETTINGS}`,
                () => {
                    const OrganizationView = lazy(() =>
                        import(
                            "./components/organization/organization-view"
                        ).then((m) => ({
                            default: m.OrganizationView
                        }))
                    )

                    return {
                        PageComponent: OrganizationView,
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
                    const OrganizationView = lazy(() =>
                        import(
                            "./components/organization/organization-view"
                        ).then((m) => ({
                            default: m.OrganizationView
                        }))
                    )

                    return {
                        PageComponent: OrganizationView,
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
                    const OrganizationView = lazy(() =>
                        import(
                            "./components/organization/organization-view"
                        ).then((m) => ({
                            default: m.OrganizationView
                        }))
                    )

                    return {
                        PageComponent: OrganizationView,
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
