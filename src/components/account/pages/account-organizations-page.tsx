"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { accountViewPaths } from "../../../lib/view-paths"
import type { AccountPluginOverrides } from "../../../plugins/account-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const AccountOrganizationsPageInternal = lazy(() =>
    import("./account-organizations-page.internal").then((m) => ({
        default: m.AccountOrganizationsPageInternal
    }))
)

export function AccountOrganizationsPage() {
    const { onRouteError } =
        usePluginOverrides<AccountPluginOverrides>("account")

    return (
        <ComposedRoute
            path={`/account/${accountViewPaths.ORGANIZATIONS}`}
            PageComponent={AccountOrganizationsPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("accountOrganizations", error, {
                        path: `/account/${accountViewPaths.ORGANIZATIONS}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
