"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { accountViewPaths } from "../../../lib/view-paths"
import { AccountView } from "../account-view"

export function AccountSettingsPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AccountView path={accountViewPaths.SETTINGS} />
        </BetterAuthPluginProvider>
    )
}
