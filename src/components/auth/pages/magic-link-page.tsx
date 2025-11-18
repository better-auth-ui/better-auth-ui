"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { authViewPaths } from "../../../lib/view-paths"
import type { AuthPluginOverrides } from "../../../plugins/auth-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const MagicLinkPageInternal = lazy(() =>
    import("./magic-link-page.internal").then((m) => ({
        default: m.MagicLinkPageInternal
    }))
)

export function MagicLinkPage() {
    const { onRouteError } = usePluginOverrides<AuthPluginOverrides>("auth")

    return (
        <ComposedRoute
            path={`/auth/${authViewPaths.MAGIC_LINK}`}
            PageComponent={MagicLinkPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("magicLink", error, {
                        path: `/auth/${authViewPaths.MAGIC_LINK}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
