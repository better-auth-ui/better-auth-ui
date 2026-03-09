"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { accountViewPaths } from "../../../lib/view-paths"
import type { AccountPluginOverrides } from "../../../plugins/account-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const AccountTeamsPageInternal = lazy(() =>
    import("./account-teams-page.internal").then((m) => ({
        default: m.AccountTeamsPageInternal
    }))
)

export function AccountTeamsPage() {
    const { onRouteError } =
        usePluginOverrides<AccountPluginOverrides>("account")

    return (
        <ComposedRoute
            path={`/account/${accountViewPaths.TEAMS}`}
            PageComponent={AccountTeamsPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("accountTeams", error, {
                        path: `/account/${accountViewPaths.TEAMS}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
