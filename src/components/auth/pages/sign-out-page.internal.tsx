"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { SignOut } from "../sign-out"

export function SignOutPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <SignOut />
        </BetterAuthPluginProvider>
    )
}
