"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { accountViewPaths } from "../../../lib/view-paths"
import type { AccountPluginOverrides } from "../../../plugins/account-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const AccountSecurityPageInternal = lazy(() =>
    import("./account-security-page.internal").then((m) => ({
        default: m.AccountSecurityPageInternal
    }))
)

export function AccountSecurityPage() {
    const { onRouteError } =
        usePluginOverrides<AccountPluginOverrides>("account")

    return (
        <ComposedRoute
            path={`/account/${accountViewPaths.SECURITY}`}
            PageComponent={AccountSecurityPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("accountSecurity", error, {
                        path: `/account/${accountViewPaths.SECURITY}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
