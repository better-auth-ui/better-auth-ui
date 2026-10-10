import { UserAvatar } from "../user/user-avatar"
import { getSafeRedirectTo } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthenticate, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAcceptInvitation,
  useInvitation,
  useRejectInvitation
} from "@better-auth-ui/react/plugins/organization"
import { Briefcase } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
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
      className={cn("w-full max-w-lg gap-0 overflow-hidden p-0", className)}
      variant={variant}
    >
      <Card.Header className="grid justify-items-center gap-5 p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-surface-secondary">
          <Briefcase aria-hidden="true" className="size-7" />
        </div>
        <div className="grid gap-1">
          <Card.Title className="max-w-full break-words text-xl font-semibold">
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : isAvailable ? (
              organizationName
            ) : (
              localization.invitationUnavailable
            )}
          </Card.Title>
          <Card.Description>
            {localization.acceptInvitationTitle}
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="px-4 pb-6 sm:px-6">
        <div className="grid gap-5 rounded-lg bg-surface-secondary p-5">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : isAvailable ? (
            <>
              <Description>
                {localization.acceptInvitationDescription
                  .replace("{{organization}}", organizationName)
                  .replace("{{role}}", role)}
              </Description>
              <dl className="grid gap-1">
                <dt className="text-sm text-muted">{localization.role}</dt>
                <dd className="text-base font-medium">{role}</dd>
              </dl>
            </>
          ) : (
            <Description>
              {localization.invitationUnavailableDescription}
            </Description>
          )}
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              user={session.data?.user}
              isPending={session.isPending}
            />
            {session.data ? (
              <div className="grid min-w-0 gap-0.5">
                <p className="break-words text-sm font-medium">
                  {session.data.user.name || session.data.user.email}
                </p>
                {session.data.user.name ? (
                  <p className="break-all text-sm text-muted">
                    {session.data.user.email}
                  </p>
                ) : null}
              </div>
            ) : (
              <Skeleton className="h-4 w-40" />
            )}
          </div>
        </div>
      </Card.Content>
      <Card.Footer className="grid grid-cols-2 gap-3 border-t border-separator p-4 sm:p-6">
        {isLoading ? (
          <>
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </>
        ) : isAvailable && invitation ? (
          <>
            <Button
              className="h-11 w-full"
              variant="secondary"
              isDisabled={isAccepting || isRejecting}
              onPress={() => rejectInvitation({ invitationId: invitation.id })}
            >
              {isRejecting ? <Spinner color="current" size="sm" /> : null}
              {localization.rejectInvitation}
            </Button>
            <Button
              className="h-11 w-full"
              isDisabled={isAccepting || isRejecting}
              onPress={() => acceptInvitation({ invitationId: invitation.id })}
            >
              {isAccepting ? <Spinner color="current" size="sm" /> : null}
              {localization.accept}
            </Button>
          </>
        ) : (
          <Button
            className="col-span-2 h-11 w-full"
            onPress={returnToApplication}
          >
            {localization.return}
          </Button>
        )}
      </Card.Footer>
    </Card>
  )
}
