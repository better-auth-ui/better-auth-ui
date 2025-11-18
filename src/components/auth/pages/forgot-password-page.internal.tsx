"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { authViewPaths } from "../../../lib/view-paths"
import { AuthView } from "../auth-view"

export function ForgotPasswordPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AuthView path={authViewPaths.FORGOT_PASSWORD} />
        </BetterAuthPluginProvider>
    )
}
