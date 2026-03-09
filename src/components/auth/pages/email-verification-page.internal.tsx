"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { authViewPaths } from "../../../lib/view-paths"
import { AuthView } from "../auth-view"

export function EmailVerificationPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AuthView path={authViewPaths.EMAIL_VERIFICATION} />
        </BetterAuthPluginProvider>
    )
}
