import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useListUserInvitations } from "@better-auth-ui/react/plugins/organization"
import { Card, type CardProps } from "@heroui/react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { UserInvitationRow } from "./user-invitation-row"
import { UserInvitationRowSkeleton } from "./user-invitation-row-skeleton"
import { UserInvitationsEmpty } from "./user-invitations-empty"

export type UserInvitationsProps = {
  variant?: CardProps["variant"]
}

/**
 * Organization invitations for the signed-in user (from
 * {@link useListUserInvitations}). Always renders the section card; uses
 * {@link UserInvitationsEmpty} when there are no pending invitations.
 */
export function UserInvitations({ variant }: UserInvitationsProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const { data: invitations, isPending } = useListUserInvitations(
    authClient as OrganizationAuthClient
  )

  return (
    <div className="flex flex-col gap-3">
      <h2 className="truncate text-sm font-semibold">
        {organizationLocalization.invitations}
      </h2>

      <Card variant={variant}>
        <Card.Content>
          {isPending ? (
            <UserInvitationRowSkeleton />
          ) : !invitations?.length ? (
            <UserInvitationsEmpty />
          ) : (
            invitations?.map((invitation, index) => (
              <div key={invitation.id}>
                {index > 0 && (
                  <div className="border-b border-dashed -mx-4 my-4" />
                )}

                <UserInvitationRow invitation={invitation} />
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </div>
  )
}
