import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAcceptInvitation,
  useRejectInvitation
} from "@better-auth-ui/react/plugins/organization"
import { Check, Clock, Xmark } from "@gravity-ui/icons"
import { Button, Chip, Spinner } from "@heroui/react"
import type { Invitation } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"

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
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        <Clock className="size-4.5" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium leading-tight">
            {invitation.organizationName}
          </span>

          <Chip size="sm">{roles?.[invitation.role] ?? invitation.role}</Chip>
        </div>

        <span className="truncate text-muted text-xs">
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
          isPending={isAccepting}
          isDisabled={isRejecting}
          onPress={() =>
            acceptInvitation({
              invitationId: invitation.id
            })
          }
        >
          {isAccepting ? <Spinner color="current" size="sm" /> : <Check />}

          {organizationLocalization.accept}
        </Button>

        <Button
          variant="danger-soft"
          size="sm"
          isIconOnly
          isPending={isRejecting}
          isDisabled={isAccepting}
          onPress={() =>
            rejectInvitation({
              invitationId: invitation.id
            })
          }
          aria-label={organizationLocalization.rejectInvitation}
        >
          {isRejecting ? <Spinner color="current" size="sm" /> : <Xmark />}
        </Button>
      </div>
    </div>
  )
}
