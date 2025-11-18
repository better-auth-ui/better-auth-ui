"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { authViewPaths } from "../../../lib/view-paths"
import { AuthView } from "../auth-view"

export function RecoverAccountPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AuthView path={authViewPaths.RECOVER_ACCOUNT} />
        </BetterAuthPluginProvider>
    )
}
