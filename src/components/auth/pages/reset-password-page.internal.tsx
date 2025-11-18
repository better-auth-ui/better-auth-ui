"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { authViewPaths } from "../../../lib/view-paths"
import { AuthView } from "../auth-view"

export function ResetPasswordPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AuthView path={authViewPaths.RESET_PASSWORD} />
        </BetterAuthPluginProvider>
    )
}
