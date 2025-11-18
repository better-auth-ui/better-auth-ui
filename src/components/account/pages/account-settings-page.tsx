"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { accountViewPaths } from "../../../lib/view-paths"
import type { AccountPluginOverrides } from "../../../plugins/account-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const AccountSettingsPageInternal = lazy(() =>
    import("./account-settings-page.internal").then((m) => ({
        default: m.AccountSettingsPageInternal
    }))
)

export function AccountSettingsPage() {
    const { onRouteError } =
        usePluginOverrides<AccountPluginOverrides>("account")

    return (
        <ComposedRoute
            path={`/account/${accountViewPaths.SETTINGS}`}
            PageComponent={AccountSettingsPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("accountSettings", error, {
                        path: `/account/${accountViewPaths.SETTINGS}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
