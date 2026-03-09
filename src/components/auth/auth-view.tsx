"use client"

import { ArrowLeftIcon } from "lucide-react"
import { type ReactNode, useContext, useEffect, useState } from "react"
import { useIsHydrated } from "../../hooks/use-hydrated"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { socialProviders } from "../../lib/social-providers"
import { cn, getViewByPath } from "../../lib/utils"
import type { AuthViewPaths } from "../../lib/view-paths"
import type { AuthLocalization } from "../../localization/auth-localization"
import { AcceptInvitationCard } from "../organization/accept-invitation-card"
import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../ui/card"
import { Separator } from "../ui/separator"
import { AuthCallback } from "./auth-callback"
import { AuthForm, type AuthFormClassNames } from "./auth-form"
import { EmailOTPButton } from "./email-otp-button"
import { MagicLinkButton } from "./magic-link-button"
import { OneTap } from "./one-tap"
import { PasskeyButton } from "./passkey-button"
import { ProviderButton } from "./provider-button"
import { SignOut } from "./sign-out"

export type AuthViewClassNames = {
    base?: string
    content?: string
    description?: string
    footer?: string
    footerLink?: string
    continueWith?: string
    form?: AuthFormClassNames
    header?: string
    separator?: string
    title?: string
}

export interface AuthViewProps {
    className?: string
    classNames?: AuthViewClassNames
    callbackURL?: string
    cardHeader?: ReactNode
    cardFooter?: ReactNode
    localization?: AuthLocalization
    path?: string
    pathname?: string
    redirectTo?: string
    socialLayout?: "auto" | "horizontal" | "grid" | "vertical"
    view?: keyof AuthViewPaths
    otpSeparators?: 0 | 1 | 2
}

export function AuthView({
    className,
    classNames,
    callbackURL,
    cardHeader,
    cardFooter,
    localization,
    path: pathProp,
    pathname,
    redirectTo,
    socialLayout: socialLayoutProp = "auto",
    view: viewProp,
    otpSeparators = 0
}: AuthViewProps) {
    const isHydrated = useIsHydrated()
    const {
        basePath,
        credentials,
        localization: contextLocalization,
        magicLink,
        emailOTP,
        oneTap,
        passkey,
        signUp,
        social,
        genericOAuth,
        viewPaths,
        Link
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    let socialLayout = socialLayoutProp
    if (socialLayout === "auto") {
        socialLayout = !credentials
            ? "vertical"
            : social?.providers && social.providers.length > 2
              ? "horizontal"
              : "vertical"
    }

    const path = pathProp ?? pathname?.split("/").pop()

    const view = viewProp || getViewByPath(viewPaths!, path) || "SIGN_IN"

    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const handlePageHide = () => setIsSubmitting(false)
        window.addEventListener("pagehide", handlePageHide)
        return () => {
            setIsSubmitting(false)
            window.removeEventListener("pagehide", handlePageHide)
        }
    }, [])

    if (view === "CALLBACK") return <AuthCallback redirectTo={redirectTo} />
    if (view === "SIGN_OUT") return <SignOut redirectTo={redirectTo} />
    if (view === "ACCEPT_INVITATION")
        return (
            <AcceptInvitationCard
                className={className}
                classNames={classNames}
            />
        )

    const description =
        !credentials && !magicLink && !emailOTP
            ? localization.DISABLED_CREDENTIALS_DESCRIPTION
            : localization[`${view}_DESCRIPTION` as keyof typeof localization]

    return (
        <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                {cardHeader ? (
                    cardHeader
                ) : (
                    <>
                        <CardTitle
                            className={cn(
                                "text-lg md:text-xl",
                                classNames?.title
                            )}
                        >
                            {localization[view as keyof typeof localization]}
                        </CardTitle>
                        {description && (
                            <CardDescription
                                className={cn(
                                    "text-xs md:text-sm",
                                    classNames?.description
                                )}
                            >
                                {description}
                            </CardDescription>
                        )}
                    </>
                )}
            </CardHeader>

            <CardContent className={cn("grid gap-6", classNames?.content)}>
                {oneTap &&
                    ["SIGN_IN", "SIGN_UP", "MAGIC_LINK", "EMAIL_OTP"].includes(
                        view as string
                    ) && (
                        <OneTap
                            localization={localization}
                            redirectTo={redirectTo}
                        />
                    )}

                {(credentials || magicLink || emailOTP) && (
                    <div className="grid gap-4">
                        <AuthForm
                            classNames={classNames?.form}
                            callbackURL={callbackURL}
                            isSubmitting={isSubmitting}
                            localization={localization}
                            otpSeparators={otpSeparators}
                            view={view}
                            redirectTo={redirectTo}
                            setIsSubmitting={setIsSubmitting}
                        />

                        {magicLink &&
                            ((credentials &&
                                [
                                    "FORGOT_PASSWORD",
                                    "SIGN_UP",
                                    "SIGN_IN",
                                    "MAGIC_LINK",
                                    "EMAIL_OTP"
                                ].includes(view as string)) ||
                                (emailOTP && view === "EMAIL_OTP")) && (
                                <MagicLinkButton
                                    classNames={classNames}
                                    localization={localization}
                                    view={view}
                                    isSubmitting={isSubmitting}
                                />
                            )}

                        {emailOTP &&
                            ((credentials &&
                                [
                                    "FORGOT_PASSWORD",
                                    "SIGN_UP",
                                    "SIGN_IN",
                                    "MAGIC_LINK",
                                    "EMAIL_OTP"
                                ].includes(view as string)) ||
                                (magicLink &&
                                    ["SIGN_IN", "MAGIC_LINK"].includes(
                                        view as string
                                    ))) && (
                                <EmailOTPButton
                                    classNames={classNames}
                                    localization={localization}
                                    view={view}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                    </div>
                )}

                {view !== "RESET_PASSWORD" &&
                    view !== "EMAIL_VERIFICATION" &&
                    (social?.providers?.length ||
                        genericOAuth?.providers?.length ||
                        (view === "SIGN_IN" && passkey)) && (
                        <>
                            {(credentials || magicLink || emailOTP) && (
                                <div
                                    className={cn(
                                        "flex items-center gap-2",
                                        classNames?.continueWith
                                    )}
                                >
                                    <Separator
                                        className={cn(
                                            "!w-auto grow",
                                            classNames?.separator
                                        )}
                                    />
                                    <span className="flex-shrink-0 text-muted-foreground text-sm">
                                        {localization.OR_CONTINUE_WITH}
                                    </span>
                                    <Separator
                                        className={cn(
                                            "!w-auto grow",
                                            classNames?.separator
                                        )}
                                    />
                                </div>
                            )}

                            <div className="grid gap-4">
                                {(social?.providers?.length ||
                                    genericOAuth?.providers?.length) && (
                                    <div
                                        className={cn(
                                            "flex w-full items-center justify-between gap-4",
                                            socialLayout === "horizontal" &&
                                                "flex-wrap",
                                            socialLayout === "vertical" &&
                                                "flex-col",
                                            socialLayout === "grid" &&
                                                "grid grid-cols-2"
                                        )}
                                    >
                                        {social?.providers?.map((provider) => {
                                            const socialProvider =
                                                socialProviders.find(
                                                    (socialProvider) =>
                                                        socialProvider.provider ===
                                                        provider
                                                )
                                            if (!socialProvider) return null
                                            return (
                                                <ProviderButton
                                                    key={provider}
                                                    classNames={classNames}
                                                    callbackURL={callbackURL}
                                                    isSubmitting={isSubmitting}
                                                    localization={localization}
                                                    provider={socialProvider}
                                                    redirectTo={redirectTo}
                                                    setIsSubmitting={
                                                        setIsSubmitting
                                                    }
                                                    socialLayout={socialLayout}
                                                />
                                            )
                                        })}
                                        {genericOAuth?.providers?.map(
                                            (provider) => (
                                                <ProviderButton
                                                    key={provider.provider}
                                                    classNames={classNames}
                                                    callbackURL={callbackURL}
                                                    isSubmitting={isSubmitting}
                                                    localization={localization}
                                                    provider={provider}
                                                    redirectTo={redirectTo}
                                                    setIsSubmitting={
                                                        setIsSubmitting
                                                    }
                                                    socialLayout={socialLayout}
                                                    other
                                                />
                                            )
                                        )}
                                    </div>
                                )}

                                {passkey &&
                                    [
                                        "SIGN_IN",
                                        "MAGIC_LINK",
                                        "EMAIL_OTP",
                                        "RECOVER_ACCOUNT",
                                        "TWO_FACTOR",
                                        "FORGOT_PASSWORD"
                                    ].includes(view as string) && (
                                        <PasskeyButton
                                            classNames={classNames}
                                            isSubmitting={isSubmitting}
                                            localization={localization}
                                            redirectTo={redirectTo}
                                            setIsSubmitting={setIsSubmitting}
                                        />
                                    )}
                            </div>
                        </>
                    )}
            </CardContent>

            {cardFooter && (
                <CardFooter className={classNames?.footer}>
                    {cardFooter}
                </CardFooter>
            )}

            {credentials && signUp && (
                <CardFooter
                    className={cn(
                        "justify-center gap-1.5 text-muted-foreground text-sm",
                        classNames?.footer
                    )}
                >
                    {view === "SIGN_IN" ||
                    view === "MAGIC_LINK" ||
                    view === "EMAIL_OTP" ? (
                        localization.DONT_HAVE_AN_ACCOUNT
                    ) : view === "SIGN_UP" ? (
                        localization.ALREADY_HAVE_AN_ACCOUNT
                    ) : (
                        <ArrowLeftIcon className="size-3" />
                    )}

                    {view === "SIGN_IN" ||
                    view === "MAGIC_LINK" ||
                    view === "EMAIL_OTP" ||
                    view === "SIGN_UP" ? (
                        <Link
                            className={cn(
                                "text-foreground underline",
                                classNames?.footerLink
                            )}
                            href={`${basePath}/${
                                viewPaths[
                                    view === "SIGN_IN" ||
                                    view === "MAGIC_LINK" ||
                                    view === "EMAIL_OTP"
                                        ? "SIGN_UP"
                                        : "SIGN_IN"
                                ]
                            }${isHydrated ? window.location.search : ""}`}
                        >
                            <Button
                                variant="link"
                                size="sm"
                                className={cn(
                                    "px-0 text-foreground underline",
                                    classNames?.footerLink
                                )}
                            >
                                {view === "SIGN_IN" ||
                                view === "MAGIC_LINK" ||
                                view === "EMAIL_OTP"
                                    ? localization.SIGN_UP
                                    : localization.SIGN_IN}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            variant="link"
                            size="sm"
                            className={cn(
                                "px-0 text-foreground underline",
                                classNames?.footerLink
                            )}
                            onClick={() => window.history.back()}
                        >
                            {localization.GO_BACK}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
