"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { accountViewPaths } from "../../../lib/view-paths"
import { AccountView } from "../account-view"

export function AccountTeamsPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AccountView path={accountViewPaths.TEAMS} />
        </BetterAuthPluginProvider>
    )
}
