"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const EmailVerificationPageInternal = lazy(() =>
    import("./email-verification-page.internal").then((m) => ({
        default: m.EmailVerificationPageInternal
    }))
)

export function EmailVerificationPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.EMAIL_VERIFICATION}`}
            PageComponent={EmailVerificationPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("emailVerification", error, {
                        path: `/auth/${authViewPaths.EMAIL_VERIFICATION}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
