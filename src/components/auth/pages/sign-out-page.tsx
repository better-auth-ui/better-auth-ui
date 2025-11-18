"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const SignOutPageInternal = lazy(() =>
    import("./sign-out-page.internal").then((m) => ({
        default: m.SignOutPageInternal
    }))
)

export function SignOutPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.SIGN_OUT}`}
            PageComponent={SignOutPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("signOut", error, {
                        path: `/auth/${authViewPaths.SIGN_OUT}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
