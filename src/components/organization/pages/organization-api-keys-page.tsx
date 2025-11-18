"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { organizationViewPaths } from "../../../lib/view-paths"
import type { OrganizationPluginOverrides } from "../../../plugins/organization-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const OrganizationApiKeysPageInternal = lazy(() =>
    import("./organization-api-keys-page.internal").then((m) => ({
        default: m.OrganizationApiKeysPageInternal
    }))
)

export function OrganizationApiKeysPage() {
    const { onRouteError } =
        usePluginOverrides<OrganizationPluginOverrides>("organization")

    return (
        <ComposedRoute
            path={`/organization/${organizationViewPaths.API_KEYS}`}
            PageComponent={OrganizationApiKeysPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("organizationApiKeys", error, {
                        path: `/organization/${organizationViewPaths.API_KEYS}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
