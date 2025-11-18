"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const RecoverAccountPageInternal = lazy(() =>
    import("./recover-account-page.internal").then((m) => ({
        default: m.RecoverAccountPageInternal
    }))
)

export function RecoverAccountPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.RECOVER_ACCOUNT}`}
            PageComponent={RecoverAccountPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("recoverAccount", error, {
                        path: `/auth/${authViewPaths.RECOVER_ACCOUNT}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
