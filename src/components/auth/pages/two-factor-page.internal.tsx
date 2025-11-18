"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { authViewPaths } from "../../../lib/view-paths"
import { AuthView } from "../auth-view"

export function TwoFactorPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AuthView path={authViewPaths.TWO_FACTOR} />
        </BetterAuthPluginProvider>
    )
}
