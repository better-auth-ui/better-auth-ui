"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { AuthCallback } from "../auth-callback"

export function CallbackPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AuthCallback />
        </BetterAuthPluginProvider>
    )
}
