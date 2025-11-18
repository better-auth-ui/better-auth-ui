"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const SignInPageInternal = lazy(() =>
    import("./sign-in-page.internal").then((m) => ({
        default: m.SignInPageInternal
    }))
)

export function SignInPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.SIGN_IN}`}
            PageComponent={SignInPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("signIn", error, {
                        path: `/auth/${authViewPaths.SIGN_IN}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
