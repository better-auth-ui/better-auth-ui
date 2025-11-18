"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const CallbackPageInternal = lazy(() =>
    import("./callback-page.internal").then((m) => ({
        default: m.CallbackPageInternal
    }))
)

export function CallbackPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.CALLBACK}`}
            PageComponent={CallbackPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("callback", error, {
                        path: `/auth/${authViewPaths.CALLBACK}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
