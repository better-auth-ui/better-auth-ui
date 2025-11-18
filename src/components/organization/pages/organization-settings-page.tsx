"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { organizationViewPaths } from "../../../lib/view-paths"
import type { OrganizationPluginOverrides } from "../../../plugins/organization-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const OrganizationSettingsPageInternal = lazy(() =>
    import("./organization-settings-page.internal").then((m) => ({
        default: m.OrganizationSettingsPageInternal
    }))
)

export function OrganizationSettingsPage() {
    const { onRouteError } =
        usePluginOverrides<OrganizationPluginOverrides>("organization")

    return (
        <ComposedRoute
            path={`/organization/${organizationViewPaths.SETTINGS}`}
            PageComponent={OrganizationSettingsPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("organizationSettings", error, {
                        path: `/organization/${organizationViewPaths.SETTINGS}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
