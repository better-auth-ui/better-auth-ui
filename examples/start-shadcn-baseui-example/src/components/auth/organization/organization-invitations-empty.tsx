"use client"

import { useAuthPlugin } from "@better-auth-ui/react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type OrganizationInvitationsEmptyProps = {
  onInvitePress: () => void
}

/**
 * Empty state for `OrganizationInvitations`.
 */
export function OrganizationInvitationsEmpty({
  onInvitePress
}: OrganizationInvitationsEmptyProps) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <div className="flex flex-col items-center gap-4 p-4 text-center">
      <Send className="size-6 text-muted-foreground" />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {organizationLocalization.noInvitations}
        </p>

        <span className="text-sm text-muted-foreground">
          {organizationLocalization.organizationInvitationsEmptyDescription}
        </span>
      </div>

      <Button size="sm" onClick={onInvitePress}>
        {organizationLocalization.inviteMember}
      </Button>
    </div>
  )
}
