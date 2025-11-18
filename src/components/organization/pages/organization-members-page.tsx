"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { organizationViewPaths } from "../../../lib/view-paths"
import type { OrganizationPluginOverrides } from "../../../plugins/organization-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const OrganizationMembersPageInternal = lazy(() =>
    import("./organization-members-page.internal").then((m) => ({
        default: m.OrganizationMembersPageInternal
    }))
)

export function OrganizationMembersPage() {
    const { onRouteError } =
        usePluginOverrides<OrganizationPluginOverrides>("organization")

    return (
        <ComposedRoute
            path={`/organization/${organizationViewPaths.MEMBERS}`}
            PageComponent={OrganizationMembersPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("organizationMembers", error, {
                        path: `/organization/${organizationViewPaths.MEMBERS}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
