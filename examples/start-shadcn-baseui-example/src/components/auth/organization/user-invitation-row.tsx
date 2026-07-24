"use client"

import {
  type OrganizationAuthClient,
  useAcceptInvitation,
  useAuth,
  useAuthPlugin,
  useRejectInvitation
} from "@better-auth-ui/react"
import type { Invitation } from "better-auth/client"
import { Check, Clock, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type UserInvitationRowProps = {
  invitation: Invitation & { organizationName?: string }
}

/**
 * Single invitation row with accept/reject actions for the current user.
 */
export function UserInvitationRow({ invitation }: UserInvitationRowProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation(authClient as OrganizationAuthClient)

  const { mutate: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation(authClient as OrganizationAuthClient)

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Clock className="size-4.5" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium leading-tight">
            {invitation.organizationName}
          </span>

          <Badge variant="secondary">
            {roles?.[invitation.role] ?? invitation.role}
          </Badge>
        </div>

        <span className="truncate text-muted-foreground text-xs">
          {new Date(invitation.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isAccepting || isRejecting}
          onClick={() => acceptInvitation({ invitationId: invitation.id })}
        >
          {isAccepting ? <Spinner /> : <Check />}

          {organizationLocalization.accept}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="size-8 text-destructive"
          disabled={isAccepting || isRejecting}
          onClick={() => rejectInvitation({ invitationId: invitation.id })}
          aria-label={organizationLocalization.rejectInvitation}
        >
          {isRejecting ? <Spinner /> : <X />}
        </Button>
      </div>
    </div>
  )
}
