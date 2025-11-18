"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const TwoFactorPageInternal = lazy(() =>
    import("./two-factor-page.internal").then((m) => ({
        default: m.TwoFactorPageInternal
    }))
)

export function TwoFactorPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.TWO_FACTOR}`}
            PageComponent={TwoFactorPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("twoFactor", error, {
                        path: `/auth/${authViewPaths.TWO_FACTOR}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
