"use client"

import { usePluginOverrides } from "@btst/stack/context"
import { type ReactNode, useMemo } from "react"
import { toast } from "sonner"
import { RecaptchaV3 } from "../components/captcha/recaptcha-v3"
import { useAuthData } from "../hooks/use-auth-data"
import { authLocalization } from "../localization/auth-localization"
import type { AccountPluginOverrides } from "../plugins/account-plugin"
import type { AuthPluginOverrides } from "../plugins/auth-plugin"
import type { OrganizationPluginOverrides } from "../plugins/organization-plugin"
import type { AccountOptionsContext } from "../types/account-options"
import type { AuthClient } from "../types/auth-client"
import type { AuthHooks } from "../types/auth-hooks"
import type { AuthMutators } from "../types/auth-mutators"
import type { AvatarOptions } from "../types/avatar-options"
import type { CredentialsOptions } from "../types/credentials-options"
import type { DeleteUserOptions } from "../types/delete-user-options"
import type { GenericOAuthOptions } from "../types/generic-oauth-options"
import type { Link } from "../types/link"
import type { OrganizationOptionsContext } from "../types/organization-options"
import type { RenderToast } from "../types/render-toast"
import type { SignUpOptions } from "../types/sign-up-options"
import type { SocialOptions } from "../types/social-options"
import { AuthUIContext, type AuthUIContextType } from "./auth-ui-provider"
import { OrganizationRefetcher } from "./organization-refetcher"
import {
    accountViewPaths,
    authViewPaths,
    organizationViewPaths
} from "./view-paths"

const DefaultLink: Link = ({ href, className, children }) => (
    <a className={className} href={href}>
        {children}
    </a>
)

const defaultNavigate = (href: string) => {
    window.location.href = href
}

const defaultReplace = (href: string) => {
    window.location.replace(href)
}

const defaultToast: RenderToast = ({ variant = "default", message }) => {
    if (variant === "default") {
        toast(message)
    } else {
        toast[variant](message)
    }
}

/**
 * Bridge component that converts btst plugin overrides to AuthUIContext
 * This allows existing components to continue using AuthUIContext
 * while the plugin system uses overrides
 */
export function BetterAuthPluginProvider({
    children
}: {
    children: ReactNode
}) {
    // Read auth plugin overrides
    const authOverrides = usePluginOverrides<
        AuthPluginOverrides,
        Partial<AuthPluginOverrides>
    >("auth", {
        localization: authLocalization,
        basePath: "/auth",
        redirectTo: "/",
        freshAge: 60 * 60 * 24,
        changeEmail: true,
        nameRequired: true,
        Link: DefaultLink,
        navigate: defaultNavigate,
        replace: defaultReplace,
        toast: defaultToast
    })

    // Read account plugin overrides (returns defaults if plugin not registered)
    const accountOverrides = usePluginOverrides<
        AccountPluginOverrides,
        Partial<AccountPluginOverrides>
    >("account", {})

    // Read organization plugin overrides (returns defaults if plugin not registered)
    const organizationOverrides = usePluginOverrides<
        OrganizationPluginOverrides,
        Partial<OrganizationPluginOverrides>
    >("organization", {})

    // Merge overrides: account/organization can override auth settings
    const overrides = {
        ...authOverrides,
        ...accountOverrides,
        ...organizationOverrides
    }

    const authClient = overrides.authClient as AuthClient

    const avatar = useMemo<AvatarOptions | undefined>(() => {
        if (!overrides.avatar) return

        if (overrides.avatar === true) {
            return {
                extension: "png",
                size: 128
            }
        }

        return {
            upload: overrides.avatar.upload,
            delete: overrides.avatar.delete,
            extension: overrides.avatar.extension || "png",
            size:
                overrides.avatar.size || (overrides.avatar.upload ? 256 : 128),
            Image: overrides.avatar.Image
        }
    }, [overrides.avatar])

    const account = useMemo<AccountOptionsContext | undefined>(() => {
        const accountProp = accountOverrides?.account
        if (!accountProp) return undefined

        if (accountProp === true) {
            // Use basePath from accountOverrides root, or default to "/account"
            const basePathRaw = accountOverrides?.basePath ?? "/account"
            const basePath = basePathRaw.endsWith("/")
                ? basePathRaw.slice(0, -1)
                : basePathRaw

            return {
                basePath,
                fields: ["image", "name"],
                viewPaths: accountViewPaths
            }
        }

        // basePath can come from either:
        // 1. accountProp.basePath (inside the account config object)
        // 2. accountOverrides.basePath (at the root, from Partial<AuthPluginOverrides>)
        // Priority: accountProp.basePath > accountOverrides.basePath > "/account"
        const basePathRaw =
            accountProp.basePath ?? accountOverrides?.basePath ?? "/account"
        const basePath = basePathRaw.endsWith("/")
            ? basePathRaw.slice(0, -1)
            : basePathRaw

        return {
            basePath,
            fields: accountProp.fields || ["image", "name"],
            viewPaths: { ...accountViewPaths, ...accountProp.viewPaths }
        }
    }, [accountOverrides?.account, accountOverrides?.basePath])

    const deleteUser = useMemo<DeleteUserOptions | undefined>(() => {
        if (!accountOverrides?.deleteUser) return

        if (accountOverrides.deleteUser === true) {
            return {}
        }

        return accountOverrides.deleteUser
    }, [accountOverrides?.deleteUser])

    const social = useMemo<SocialOptions | undefined>(() => {
        return overrides.social
    }, [overrides.social])

    const genericOAuth = useMemo<GenericOAuthOptions | undefined>(() => {
        return overrides.genericOAuth
    }, [overrides.genericOAuth])

    const credentials = useMemo<CredentialsOptions | undefined>(() => {
        if (overrides.credentials === false) return

        if (overrides.credentials === true) {
            return {
                forgotPassword: true
            }
        }

        return {
            ...overrides.credentials,
            forgotPassword: overrides.credentials?.forgotPassword ?? true
        }
    }, [overrides.credentials])

    const signUp = useMemo<SignUpOptions | undefined>(() => {
        if (overrides.signUp === false) return

        if (overrides.signUp === true || overrides.signUp === undefined) {
            return {
                fields: ["name"]
            }
        }

        return {
            fields: overrides.signUp.fields || ["name"]
        }
    }, [overrides.signUp])

    const organization = useMemo<OrganizationOptionsContext | undefined>(() => {
        const organizationProp = organizationOverrides?.organization
        if (!organizationProp) return undefined

        if (organizationProp === true) {
            // Use basePath from organizationOverrides root, or default to "/organization"
            const basePathRaw =
                organizationOverrides?.basePath ?? "/organization"
            const basePath = basePathRaw.endsWith("/")
                ? basePathRaw.slice(0, -1)
                : basePathRaw

            return {
                basePath,
                viewPaths: organizationViewPaths,
                customRoles: []
            }
        }

        let logo: OrganizationOptionsContext["logo"] | undefined

        if (organizationProp.logo === true) {
            logo = {
                extension: "png",
                size: 128
            }
        } else if (organizationProp.logo) {
            logo = {
                upload: organizationProp.logo.upload,
                delete: organizationProp.logo.delete,
                extension: organizationProp.logo.extension || "png",
                size:
                    organizationProp.logo.size ||
                    (organizationProp.logo.upload ? 256 : 128)
            }
        }

        // basePath can come from either:
        // 1. organizationProp.basePath (inside the organization config object)
        // 2. organizationOverrides.basePath (at the root, from Partial<AuthPluginOverrides>)
        // Priority: organizationProp.basePath > organizationOverrides.basePath > "/organization"
        const basePathRaw =
            organizationProp.basePath ??
            organizationOverrides?.basePath ??
            "/organization"
        const basePath = basePathRaw.endsWith("/")
            ? basePathRaw.slice(0, -1)
            : basePathRaw

        return {
            ...organizationProp,
            logo,
            basePath,
            customRoles: organizationProp.customRoles || [],
            viewPaths: {
                ...organizationViewPaths,
                ...organizationProp.viewPaths
            }
        }
    }, [organizationOverrides?.organization, organizationOverrides?.basePath])

    const defaultMutators = useMemo(() => {
        return {
            deleteApiKey: (params: any) =>
                authClient.apiKey.delete({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            deletePasskey: (params: any) =>
                authClient.passkey.deletePasskey({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            revokeDeviceSession: (params: any) =>
                authClient.multiSession.revoke({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            revokeSession: (params: any) =>
                authClient.revokeSession({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            setActiveSession: (params: any) =>
                authClient.multiSession.setActive({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            updateOrganization: (params: any) =>
                authClient.organization.update({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            updateUser: (params: any) =>
                authClient.updateUser({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            unlinkAccount: (params: any) =>
                authClient.unlinkAccount({
                    ...params,
                    fetchOptions: { throw: true }
                })
        } as AuthMutators
    }, [authClient])

    const defaultHooks = useMemo(() => {
        return {
            useSession: authClient.useSession,
            useListAccounts: () =>
                useAuthData({
                    queryFn: authClient.listAccounts,
                    cacheKey: "listAccounts"
                }),
            useAccountInfo: (params: any) =>
                useAuthData({
                    queryFn: () => authClient.accountInfo(params),
                    cacheKey: `accountInfo:${JSON.stringify(params)}`
                }),
            useListDeviceSessions: () =>
                useAuthData({
                    queryFn: authClient.multiSession.listDeviceSessions,
                    cacheKey: "listDeviceSessions"
                }),
            useListSessions: () =>
                useAuthData({
                    queryFn: authClient.listSessions,
                    cacheKey: "listSessions"
                }),
            useListPasskeys: authClient.useListPasskeys,
            useListApiKeys: () =>
                useAuthData({
                    queryFn: authClient.apiKey.list,
                    cacheKey: "listApiKeys"
                }),
            useActiveOrganization: authClient.useActiveOrganization,
            useListOrganizations: authClient.useListOrganizations,
            useHasPermission: (params: any) =>
                useAuthData({
                    queryFn: () =>
                        authClient.$fetch("/organization/has-permission", {
                            method: "POST",
                            body: params
                        }),
                    cacheKey: `hasPermission:${JSON.stringify(params)}`
                }),
            useInvitation: (params: any) =>
                useAuthData({
                    queryFn: () =>
                        authClient.organization.getInvitation(params),
                    cacheKey: `invitation:${JSON.stringify(params)}`
                }),
            useListInvitations: (params: any) =>
                useAuthData({
                    queryFn: () =>
                        authClient.$fetch(
                            `/organization/list-invitations?organizationId=${params?.query?.organizationId || ""}`
                        ),
                    cacheKey: `listInvitations:${JSON.stringify(params)}`
                }),
            useListUserInvitations: () =>
                useAuthData({
                    queryFn: () =>
                        authClient.$fetch(
                            "/organization/list-user-invitations"
                        ),
                    cacheKey: `listUserInvitations`
                }),
            useListMembers: (params: any) =>
                useAuthData({
                    queryFn: () =>
                        authClient.$fetch(
                            `/organization/list-members?organizationId=${params?.query?.organizationId || ""}`
                        ),
                    cacheKey: `listMembers:${JSON.stringify(params)}`
                })
        } as AuthHooks
    }, [authClient])

    const viewPaths = useMemo(() => {
        return { ...authViewPaths, ...overrides.viewPaths }
    }, [overrides.viewPaths])

    const localization = useMemo(() => {
        return { ...authLocalization, ...overrides.localization }
    }, [overrides.localization])

    const hooks = useMemo(() => {
        return { ...defaultHooks, ...overrides.hooks }
    }, [defaultHooks, overrides.hooks])

    const mutators = useMemo(() => {
        return { ...defaultMutators, ...overrides.mutators }
    }, [defaultMutators, overrides.mutators])

    // Remove trailing slash from baseURL
    const baseURL = overrides.baseURL
        ? overrides.baseURL.endsWith("/")
            ? overrides.baseURL.slice(0, -1)
            : overrides.baseURL
        : ""

    // Remove trailing slash from basePath
    const basePath = overrides.basePath
        ? overrides.basePath.endsWith("/")
            ? overrides.basePath.slice(0, -1)
            : overrides.basePath
        : "/auth"

    const { data: sessionData } = hooks.useSession()

    const contextValue: AuthUIContextType = {
        authClient,
        avatar,
        basePath: basePath === "/" ? "" : basePath,
        baseURL,
        captcha: overrides.captcha,
        redirectTo: overrides.redirectTo || "/",
        changeEmail: overrides.changeEmail ?? true,
        credentials,
        deleteUser,
        freshAge: overrides.freshAge ?? 60 * 60 * 24,
        genericOAuth,
        hooks,
        mutators,
        localization,
        nameRequired: overrides.nameRequired ?? true,
        organization,
        account,
        signUp,
        social,
        toast: overrides.toast || defaultToast,
        navigate: overrides.navigate || defaultNavigate,
        replace: overrides.replace || overrides.navigate || defaultReplace,
        viewPaths,
        Link: overrides.Link || DefaultLink,
        apiKey: overrides.apiKey,
        gravatar: overrides.gravatar,
        additionalFields: overrides.additionalFields,
        magicLink: overrides.magicLink,
        emailOTP: overrides.emailOTP,
        passkey: overrides.passkey,
        oneTap: overrides.oneTap,
        twoFactor: overrides.twoFactor,
        multiSession: overrides.multiSession,
        emailVerification: overrides.emailVerification,
        persistClient: overrides.persistClient,
        optimistic: overrides.optimistic,
        onSessionChange: overrides.onSessionChange
    }

    return (
        <AuthUIContext.Provider value={contextValue}>
            {sessionData && organization && <OrganizationRefetcher />}

            {overrides.captcha?.provider === "google-recaptcha-v3" ? (
                <RecaptchaV3>{children}</RecaptchaV3>
            ) : (
                children
            )}
        </AuthUIContext.Provider>
    )
}
