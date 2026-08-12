import { getSafeRedirectTo } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthenticate, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAcceptInvitation,
  useInvitation,
  useRejectInvitation
} from "@better-auth-ui/react/plugins/organization"
import { Briefcase, Check, Xmark } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Chip,
  cn,
  Description,
  Skeleton,
  Spinner,
  useIsHydrated
} from "@heroui/react"
import type { Invitation } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"

type UserInvitation = Invitation & { organizationName?: string }

export type AcceptInvitationProps = {
  className?: string
  variant?: CardProps["variant"]
}

function isPendingInvitation(invitation: UserInvitation | undefined) {
  if (invitation?.status !== "pending") return false

  return new Date(invitation.expiresAt).getTime() > Date.now()
}

/**
 * Render the organization invitation addressed by the `invitationId` query
 * parameter and let the signed-in recipient accept or reject it directly.
 */
export function AcceptInvitation({
  className,
  variant
}: AcceptInvitationProps) {
  const { authClient, navigate, redirectTo } = useAuth()
  const { localization, roles } = useAuthPlugin(organizationPlugin)
  const organizationAuthClient = authClient as OrganizationAuthClient
  const isHydrated = useIsHydrated()
  const invitationId = isHydrated
    ? new URLSearchParams(window.location.search).get("invitationId")
    : null
  const session = useAuthenticate(organizationAuthClient)
  const invitationQuery = useInvitation(organizationAuthClient, {
    query: { id: invitationId ?? "" },
    enabled: Boolean(invitationId)
  })
  const invitation = invitationQuery.data as UserInvitation | undefined

  const returnToApplication = () => {
    navigate({
      to: getSafeRedirectTo(redirectTo, window.location.origin),
      replace: true
    })
  }

  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation(organizationAuthClient, {
      onSuccess: returnToApplication
    })
  const { mutate: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation(organizationAuthClient, {
      onSuccess: returnToApplication
    })
  const isLoading =
    !isHydrated ||
    session.isPending ||
    !session.data ||
    (Boolean(invitationId) && invitationQuery.isPending)
  const isAvailable = isPendingInvitation(invitation)
  const organizationName =
    invitation?.organizationName || localization.organization
  const role = invitation
    ? (roles?.[invitation.role] ?? invitation.role)
    : localization.member

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header className="gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
          <Briefcase className="size-5" />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <Card.Title className="text-xl font-semibold">
            {isLoading ? (
              <Skeleton className="h-6 w-48 rounded-lg" />
            ) : isAvailable ? (
              localization.acceptInvitationTitle
            ) : (
              localization.invitationUnavailable
            )}
          </Card.Title>
        </div>
      </Card.Header>

      <Card.Content className="gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
          </div>
        ) : isAvailable ? (
          <>
            <Description className="text-sm">
              {localization.acceptInvitationDescription
                .replace("{{organization}}", organizationName)
                .replace("{{role}}", role)}
            </Description>

            <div className="flex items-center gap-3 rounded-xl bg-surface-secondary p-3">
              <div className="min-w-0 flex-1 truncate text-sm font-medium">
                {organizationName}
              </div>
              <Chip size="sm">{role}</Chip>
            </div>
          </>
        ) : (
          <Description className="text-sm">
            {localization.invitationUnavailableDescription}
          </Description>
        )}
      </Card.Content>

      <Card.Footer className="gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
          </>
        ) : isAvailable && invitation ? (
          <>
            <Button
              className="flex-1"
              variant="tertiary"
              isDisabled={isAccepting || isRejecting}
              isPending={isRejecting}
              onPress={() => rejectInvitation({ invitationId: invitation.id })}
            >
              {isRejecting ? <Spinner color="current" size="sm" /> : <Xmark />}
              {localization.rejectInvitation}
            </Button>

            <Button
              className="flex-1"
              isDisabled={isAccepting || isRejecting}
              isPending={isAccepting}
              onPress={() => acceptInvitation({ invitationId: invitation.id })}
            >
              {isAccepting ? <Spinner color="current" size="sm" /> : <Check />}
              {localization.accept}
            </Button>
          </>
        ) : (
          <Button className="w-full" onPress={returnToApplication}>
            {localization.return}
          </Button>
        )}
      </Card.Footer>
    </Card>
  )
}
