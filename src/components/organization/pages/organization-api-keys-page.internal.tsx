"use client"

import { BetterAuthPluginProvider } from "../../../lib/plugin-context-bridge"
import { organizationViewPaths } from "../../../lib/view-paths"
import { OrganizationView } from "../organization-view"

export function OrganizationApiKeysPageInternal() {
    return (
        <BetterAuthPluginProvider>
            <OrganizationView path={organizationViewPaths.API_KEYS} />
        </BetterAuthPluginProvider>
    )
}
