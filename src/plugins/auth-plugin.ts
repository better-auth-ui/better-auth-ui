import { createRoute, defineClientPlugin } from "@btst/stack/plugins/client"
import { lazy } from "react"
import type { AuthViewPaths } from "../lib/view-paths"
import { authViewPaths } from "../lib/view-paths"
import type { AuthLocalization } from "../localization/auth-localization"
import type { AdditionalFields } from "../types/additional-fields"
import type { AnyAuthClient } from "../types/any-auth-client"
import type { AuthHooks } from "../types/auth-hooks"
import type { AuthMutators } from "../types/auth-mutators"
import type { AvatarOptions } from "../types/avatar-options"
import type { CaptchaOptions } from "../types/captcha-options"
import type { CredentialsOptions } from "../types/credentials-options"
import type { GenericOAuthOptions } from "../types/generic-oauth-options"
import type { GravatarOptions } from "../types/gravatar-options"
import type { Link } from "../types/link"
import type { RenderToast } from "../types/render-toast"
import type { SignUpOptions } from "../types/sign-up-options"
import type { SocialOptions } from "../types/social-options"

/**
 * Configuration for auth client plugin
 */
export interface AuthClientConfig {
    siteBaseURL: string
    siteBasePath: string

    // Optional context to pass to loaders (for SSR)
    context?: Record<string, unknown>
}

/**
 * Plugin override interface for auth plugin
 * Defines all configurable options that can be overridden via BetterStackProvider
 */
export interface AuthPluginOverrides {
    /**
     * Better Auth client returned from createAuthClient
     * @required
     */
    authClient: AnyAuthClient
    /**
     * Custom Link component for navigation
     * @default <a>
     */
    Link?: Link
    /**
     * Navigate to a new URL
     * @default window.location.href
     */
    navigate?: (href: string) => void
    /**
     * Replace the current URL
     * @default navigate
     */
    replace?: (href: string) => void
    /**
     * Render custom Toasts
     * @default Sonner
     */
    toast?: RenderToast
    /**
     * Customize the Localization strings
     */
    localization?: AuthLocalization
    /**
     * Base path for the auth views
     * @default "/auth"
     */
    basePath?: string
    /**
     * Front end base URL for auth API callbacks
     */
    baseURL?: string
    /**
     * Default redirect URL after authenticating
     * @default "/"
     */
    redirectTo?: string
    /**
     * Captcha configuration
     */
    captcha?: CaptchaOptions
    /**
     * Credentials configuration
     */
    credentials?: boolean | CredentialsOptions
    /**
     * Sign Up configuration
     */
    signUp?: boolean | SignUpOptions
    /**
     * Social provider configuration
     */
    social?: SocialOptions
    /**
     * Generic OAuth provider configuration
     */
    genericOAuth?: GenericOAuthOptions
    /**
     * Enable or disable Magic Link support
     * @default false
     */
    magicLink?: boolean
    /**
     * Enable or disable Email OTP support
     * @default false
     */
    emailOTP?: boolean
    /**
     * Enable or disable Passkey support
     * @default false
     */
    passkey?: boolean
    /**
     * Enable or disable One Tap support
     * @default false
     */
    oneTap?: boolean
    /**
     * Enable or disable two-factor authentication support
     */
    twoFactor?: ("otp" | "totp")[]
    /**
     * Enable or disable Multi Session support
     * @default false
     */
    multiSession?: boolean
    /**
     * Show Verify Email card for unverified emails
     */
    emailVerification?: boolean
    /**
     * Enable or disable user change email support
     * @default true
     */
    changeEmail?: boolean
    /**
     * Whether the name field should be required
     * @default true
     */
    nameRequired?: boolean
    /**
     * API Key plugin configuration
     */
    apiKey?:
        | {
              /**
               * Prefix for API Keys
               */
              prefix?: string
              /**
               * Metadata for API Keys
               */
              metadata?: Record<string, unknown>
          }
        | boolean
    /**
     * Gravatar configuration
     */
    gravatar?: boolean | GravatarOptions
    /**
     * Avatar configuration
     */
    avatar?: boolean | AvatarOptions
    /**
     * Additional fields for users
     */
    additionalFields?: AdditionalFields
    /**
     * Freshness age for Session data
     * @default 60 * 60 * 24
     */
    freshAge?: number
    /**
     * Forces better-auth-tanstack to refresh the Session on the auth callback page
     * @default false
     */
    persistClient?: boolean
    /**
     * Perform some User updates optimistically
     * @default false
     */
    optimistic?: boolean
    /**
     * ADVANCED: Custom hooks for fetching auth data
     */
    hooks?: Partial<AuthHooks>
    /**
     * ADVANCED: Custom mutators for updating auth data
     */
    mutators?: Partial<AuthMutators>
    /**
     * Called whenever the Session changes
     */
    onSessionChange?: () => void | Promise<void>
    /**
     * Customize the paths for the auth views
     */
    viewPaths?: Partial<AuthViewPaths>
    /**
     * Called when a route error occurs
     */
    onRouteError?: (
        routeName: string,
        error: Error,
        context: { path: string; isSSR: boolean }
    ) => void
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
export const authClientPlugin = (config: AuthClientConfig) =>
    defineClientPlugin<AuthPluginOverrides>({
        name: "auth",
        routes: () => ({
            signIn: createRoute(`/auth/${authViewPaths.SIGN_IN}`, () => {
                const SignInPage = lazy(() =>
                    import("../components/auth/pages/sign-in-page").then(
                        (m) => ({
                            default: m.SignInPage
                        })
                    )
                )

                return {
                    PageComponent: SignInPage,
                    meta: createAuthMeta(
                        config,
                        `/auth/${authViewPaths.SIGN_IN}`,
                        "Sign In",
                        "Sign in to your account"
                    )
                }
            }),
            signUp: createRoute(`/auth/${authViewPaths.SIGN_UP}`, () => {
                const SignUpPage = lazy(() =>
                    import("../components/auth/pages/sign-up-page").then(
                        (m) => ({
                            default: m.SignUpPage
                        })
                    )
                )

                return {
                    PageComponent: SignUpPage,
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
                    const ForgotPasswordPage = lazy(() =>
                        import(
                            "../components/auth/pages/forgot-password-page"
                        ).then((m) => ({
                            default: m.ForgotPasswordPage
                        }))
                    )

                    return {
                        PageComponent: ForgotPasswordPage,
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
                    const ResetPasswordPage = lazy(() =>
                        import(
                            "../components/auth/pages/reset-password-page"
                        ).then((m) => ({
                            default: m.ResetPasswordPage
                        }))
                    )

                    return {
                        PageComponent: ResetPasswordPage,
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
                const MagicLinkPage = lazy(() =>
                    import("../components/auth/pages/magic-link-page").then(
                        (m) => ({
                            default: m.MagicLinkPage
                        })
                    )
                )

                return {
                    PageComponent: MagicLinkPage,
                    meta: createAuthMeta(
                        config,
                        `/auth/${authViewPaths.MAGIC_LINK}`,
                        "Magic Link",
                        "Sign in with magic link"
                    )
                }
            }),
            emailOtp: createRoute(`/auth/${authViewPaths.EMAIL_OTP}`, () => {
                const EmailOtpPage = lazy(() =>
                    import("../components/auth/pages/email-otp-page").then(
                        (m) => ({
                            default: m.EmailOtpPage
                        })
                    )
                )

                return {
                    PageComponent: EmailOtpPage,
                    meta: createAuthMeta(
                        config,
                        `/auth/${authViewPaths.EMAIL_OTP}`,
                        "Email Code",
                        "Sign in with email code"
                    )
                }
            }),
            twoFactor: createRoute(`/auth/${authViewPaths.TWO_FACTOR}`, () => {
                const TwoFactorPage = lazy(() =>
                    import("../components/auth/pages/two-factor-page").then(
                        (m) => ({
                            default: m.TwoFactorPage
                        })
                    )
                )

                return {
                    PageComponent: TwoFactorPage,
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
                    const RecoverAccountPage = lazy(() =>
                        import(
                            "../components/auth/pages/recover-account-page"
                        ).then((m) => ({
                            default: m.RecoverAccountPage
                        }))
                    )

                    return {
                        PageComponent: RecoverAccountPage,
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
                const CallbackPage = lazy(() =>
                    import("../components/auth/pages/callback-page").then(
                        (m) => ({
                            default: m.CallbackPage
                        })
                    )
                )

                return {
                    PageComponent: CallbackPage
                }
            }),
            signOut: createRoute(`/auth/${authViewPaths.SIGN_OUT}`, () => {
                const SignOutPage = lazy(() =>
                    import("../components/auth/pages/sign-out-page").then(
                        (m) => ({
                            default: m.SignOutPage
                        })
                    )
                )

                return {
                    PageComponent: SignOutPage
                }
            }),
            acceptInvitation: createRoute(
                `/auth/${authViewPaths.ACCEPT_INVITATION}`,
                () => {
                    const AcceptInvitationPage = lazy(() =>
                        import(
                            "../components/auth/pages/accept-invitation-page"
                        ).then((m) => ({
                            default: m.AcceptInvitationPage
                        }))
                    )

                    return {
                        PageComponent: AcceptInvitationPage
                    }
                }
            )
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
