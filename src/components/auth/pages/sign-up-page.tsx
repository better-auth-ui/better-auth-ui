"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const SignUpPageInternal = lazy(() =>
    import("./sign-up-page.internal").then((m) => ({
        default: m.SignUpPageInternal
    }))
)

export function SignUpPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.SIGN_UP}`}
            PageComponent={SignUpPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("signUp", error, {
                        path: `/auth/${authViewPaths.SIGN_UP}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
