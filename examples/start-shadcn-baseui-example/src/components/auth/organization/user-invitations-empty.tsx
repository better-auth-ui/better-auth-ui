"use client"

import { useAuthPlugin } from "@better-auth-ui/react"
import { Send } from "lucide-react"

import { organizationPlugin } from "@/lib/auth/organization-plugin"

/**
 * Empty state for `UserInvitations`.
 */
export function UserInvitationsEmpty() {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <div className="flex flex-col items-center gap-4 p-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Send className="size-5" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {organizationLocalization.noInvitations}
        </p>

        <span className="text-sm text-muted-foreground">
          {organizationLocalization.userInvitationsEmptyDescription}
        </span>
      </div>
    </div>
  )
}
