"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { organizationViewPaths } from "../../../lib/view-paths"
import type { OrganizationPluginOverrides } from "../../../plugins/organization-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const OrganizationTeamsPageInternal = lazy(() =>
    import("./organization-teams-page.internal").then((m) => ({
        default: m.OrganizationTeamsPageInternal
    }))
)

export function OrganizationTeamsPage() {
    const { onRouteError } =
        usePluginOverrides<OrganizationPluginOverrides>("organization")

    return (
        <ComposedRoute
            path={`/organization/${organizationViewPaths.TEAMS}`}
            PageComponent={OrganizationTeamsPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("organizationTeams", error, {
                        path: `/organization/${organizationViewPaths.TEAMS}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
