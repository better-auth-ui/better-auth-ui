"use client"

import { useContext, useEffect } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getViewByPath } from "../../lib/utils"
import type { AuthViewPath } from "../../lib/view-paths"
import type { AuthLocalization } from "../../localization/auth-localization"
import { AuthCallback } from "./auth-callback"
import { EmailOTPForm } from "./forms/email-otp-form"
import { EmailVerificationForm } from "./forms/email-verification-form"
import { ForgotPasswordForm } from "./forms/forgot-password-form"
import { MagicLinkForm } from "./forms/magic-link-form"
import { RecoverAccountForm } from "./forms/recover-account-form"
import { ResetPasswordForm } from "./forms/reset-password-form"
import { SignInForm } from "./forms/sign-in-form"
import { SignUpForm } from "./forms/sign-up-form"
import { TwoFactorForm } from "./forms/two-factor-form"
import { SignOut } from "./sign-out"

export type AuthFormClassNames = {
    base?: string
    button?: string
    checkbox?: string
    description?: string
    error?: string
    forgotPasswordLink?: string
    icon?: string
    input?: string
    label?: string
    otpInput?: string
    otpInputContainer?: string
    outlineButton?: string
    primaryButton?: string
    providerButton?: string
    qrCode?: string
    secondaryButton?: string
}

export interface AuthFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization?: Partial<AuthLocalization>
    pathname?: string
    redirectTo?: string
    view?: AuthViewPath
    otpSeparators?: 0 | 1 | 2
    setIsSubmitting?: (isSubmitting: boolean) => void
}

/**
 * Render the appropriate authentication UI view based on component props and AuthUIContext feature flags.
 *
 * The component chooses a view from (in priority): the `view` prop, a view resolved from `pathname`, or `"SIGN_IN"`, then validates that the view is allowed given enabled features and credentials before rendering the corresponding form component.
 *
 * @param className - Optional base CSS class applied to rendered form components
 * @param classNames - Optional object of per-element CSS class overrides for rendered form components
 * @param callbackURL - Optional URL used by flows that require a callback (magic link, email OTP)
 * @param isSubmitting - Whether a form submission is currently in progress
 * @param localization - Optional localization strings that override context-provided localization
 * @param pathname - Optional path to resolve the active auth view when `view` is not provided
 * @param redirectTo - Optional URL to redirect to after successful authentication
 * @param view - Optional explicit view to render; takes precedence over `pathname`
 * @param otpSeparators - Number of visual separators to render between OTP input groups
 * @param setIsSubmitting - Setter to update the submitting state
 * @returns The React element for the selected authentication view, or `null` if no suitable view is available.
 */
export function AuthForm({
    className,
    classNames,
    callbackURL,
    isSubmitting,
    localization,
    pathname,
    redirectTo,
    view,
    otpSeparators = 0,
    setIsSubmitting
}: AuthFormProps) {
    const {
        basePath,
        credentials,
        localization: contextLocalization,
        magicLink,
        emailOTP,
        signUp,
        twoFactor: twoFactorEnabled,
        viewPaths,
        replace
    } = useContext(AuthUIContext)

    const signUpEnabled = !!signUp

    localization = { ...contextLocalization, ...localization }

    useEffect(() => {
        if (pathname && !getViewByPath(viewPaths, pathname)) {
            console.error(`Invalid auth view: ${pathname}`)
            replace(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`)
        }
    }, [pathname, viewPaths, basePath, replace])

    view =
        view ||
        (getViewByPath(viewPaths, pathname) as AuthViewPath) ||
        "SIGN_IN"

    // Redirect to appropriate view based on enabled features
    useEffect(() => {
        let isInvalidView = false

        if (
            view === "MAGIC_LINK" &&
            (!magicLink || (!credentials && !emailOTP))
        ) {
            isInvalidView = true
        }

        if (
            view === "EMAIL_OTP" &&
            (!emailOTP || (!credentials && !magicLink))
        ) {
            isInvalidView = true
        }

        if (view === "SIGN_UP" && !signUpEnabled) {
            isInvalidView = true
        }

        if (
            !credentials &&
            [
                "SIGN_UP",
                "FORGOT_PASSWORD",
                "RESET_PASSWORD",
                "TWO_FACTOR",
                "RECOVER_ACCOUNT"
            ].includes(view)
        ) {
            isInvalidView = true
        }

        if (
            ["TWO_FACTOR", "RECOVER_ACCOUNT"].includes(view) &&
            !twoFactorEnabled
        ) {
            isInvalidView = true
        }

        if (isInvalidView) {
            replace(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`)
        }
    }, [
        basePath,
        view,
        viewPaths,
        credentials,
        replace,
        emailOTP,
        signUpEnabled,
        magicLink,
        twoFactorEnabled
    ])

    if (view === "SIGN_OUT") return <SignOut redirectTo={redirectTo} />
    if (view === "CALLBACK") return <AuthCallback redirectTo={redirectTo} />

    if (view === "SIGN_IN") {
        return credentials ? (
            <SignInForm
                className={className}
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        ) : magicLink ? (
            <MagicLinkForm
                className={className}
                classNames={classNames}
                callbackURL={callbackURL}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        ) : emailOTP ? (
            <EmailOTPForm
                className={className}
                classNames={classNames}
                callbackURL={callbackURL}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        ) : null
    }

    if (view === "TWO_FACTOR") {
        return (
            <TwoFactorForm
                className={className}
                classNames={classNames}
                localization={localization}
                otpSeparators={otpSeparators}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        )
    }

    if (view === "RECOVER_ACCOUNT") {
        return (
            <RecoverAccountForm
                className={className}
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        )
    }

    if (view === "MAGIC_LINK") {
        return (
            <MagicLinkForm
                className={className}
                classNames={classNames}
                callbackURL={callbackURL}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        )
    }

    if (view === "EMAIL_OTP") {
        return (
            <EmailOTPForm
                className={className}
                classNames={classNames}
                callbackURL={callbackURL}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        )
    }

    if (view === "EMAIL_VERIFICATION") {
        return (
            <EmailVerificationForm
                className={className}
                classNames={classNames}
                callbackURL={callbackURL}
                localization={localization}
                otpSeparators={otpSeparators}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        )
    }

    if (view === "FORGOT_PASSWORD") {
        return (
            <ForgotPasswordForm
                className={className}
                classNames={classNames}
                localization={localization}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        )
    }

    if (view === "RESET_PASSWORD") {
        return (
            <ResetPasswordForm
                className={className}
                classNames={classNames}
                localization={localization}
            />
        )
    }

    if (view === "SIGN_UP") {
        return (
            signUpEnabled && (
                <SignUpForm
                    className={className}
                    classNames={classNames}
                    callbackURL={callbackURL}
                    localization={localization}
                    redirectTo={redirectTo}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                />
            )
        )
    }
}
