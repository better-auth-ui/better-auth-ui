"use client"

import { ComposedRoute } from "@btst/stack/client/components"
import { usePluginOverrides } from "@btst/stack/context"
import { lazy } from "react"
import { accountViewPaths } from "../../../lib/view-paths"
import type { AccountPluginOverrides } from "../../../plugins/account-plugin"
import { DefaultError } from "../../shared/default-error"
import { NotFoundPage } from "../../shared/not-found-page"
import { PageLoading } from "../../shared/page-loading"

const AccountApiKeysPageInternal = lazy(() =>
    import("./account-api-keys-page.internal").then((m) => ({
        default: m.AccountApiKeysPageInternal
    }))
)

export function AccountApiKeysPage() {
    const { onRouteError } =
        usePluginOverrides<AccountPluginOverrides>("account")

    return (
        <ComposedRoute
            path={`/account/${accountViewPaths.API_KEYS}`}
            PageComponent={AccountApiKeysPageInternal}
            ErrorComponent={DefaultError}
            LoadingComponent={PageLoading}
            NotFoundComponent={NotFoundPage}
            onError={(error) => {
                if (onRouteError) {
                    onRouteError("accountApiKeys", error, {
                        path: `/account/${accountViewPaths.API_KEYS}`,
                        isSSR: typeof window === "undefined"
                    })
                }
            }}
        />
    )
}
