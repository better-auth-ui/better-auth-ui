"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const ForgotPasswordPageInternal = lazy(() =>
    import("./forgot-password-page.internal").then((m) => ({
        default: m.ForgotPasswordPageInternal
    }))
)

export function ForgotPasswordPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.FORGOT_PASSWORD}`}
            PageComponent={ForgotPasswordPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("forgotPassword", error, {
                        path: `/auth/${authViewPaths.FORGOT_PASSWORD}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
