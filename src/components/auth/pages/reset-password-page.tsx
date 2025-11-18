"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const ResetPasswordPageInternal = lazy(() =>
    import("./reset-password-page.internal").then((m) => ({
        default: m.ResetPasswordPageInternal
    }))
)

export function ResetPasswordPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.RESET_PASSWORD}`}
            PageComponent={ResetPasswordPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("resetPassword", error, {
                        path: `/auth/${authViewPaths.RESET_PASSWORD}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
