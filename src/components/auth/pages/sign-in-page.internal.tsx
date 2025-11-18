"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { authViewPaths } from "../../../lib/view-paths"
import { AuthView } from "../auth-view"

export function SignInPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AuthView path={authViewPaths.SIGN_IN} />
        </BetterAuthPluginProvider>
    )
}
