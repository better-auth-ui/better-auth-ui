"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const EmailOtpPageInternal = lazy(() =>
    import("./email-otp-page.internal").then((m) => ({
        default: m.EmailOtpPageInternal
    }))
)

export function EmailOtpPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.EMAIL_OTP}`}
            PageComponent={EmailOtpPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("emailOtp", error, {
                        path: `/auth/${authViewPaths.EMAIL_OTP}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
