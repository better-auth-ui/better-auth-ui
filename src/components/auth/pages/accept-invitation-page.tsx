"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const AcceptInvitationPageInternal = lazy(() =>
    import("./accept-invitation-page.internal").then((m) => ({
        default: m.AcceptInvitationPageInternal
    }))
)

export function AcceptInvitationPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.ACCEPT_INVITATION}`}
            PageComponent={AcceptInvitationPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("acceptInvitation", error, {
                        path: `/auth/${authViewPaths.ACCEPT_INVITATION}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
