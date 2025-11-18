"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { AcceptInvitationCard } from "../../organization/accept-invitation-card"

export function AcceptInvitationPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <AcceptInvitationCard />
        </BetterAuthPluginProvider>
    )
}
