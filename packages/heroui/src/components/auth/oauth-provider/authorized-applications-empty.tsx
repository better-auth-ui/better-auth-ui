"use client"

import { useAuthPlugin } from "@better-auth-ui/react"
import { Shield } from "@gravity-ui/icons"

import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"

export function AuthorizedApplicationsEmpty() {
  const { localization } = useAuthPlugin(oauthProviderPlugin)

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
        <Shield className="size-4.5" />
      </div>

      <div className="flex flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm font-semibold">
          {localization.noConnectedApplications}
        </p>

        <p className="text-muted text-xs">
          {localization.connectedApplicationsDescription}
        </p>
      </div>
    </div>
  )
}
