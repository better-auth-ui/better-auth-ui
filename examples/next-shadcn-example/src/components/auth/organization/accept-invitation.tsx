"use client"

import { getSafeRedirectTo } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthenticate, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAcceptInvitation,
  useInvitation,
  useRejectInvitation
} from "@better-auth-ui/react/plugins/organization"
import type { Invitation } from "better-auth/client"
import { BriefcaseBusiness } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { FieldDescription } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { UserAvatar } from "../user/user-avatar"
import { cn } from "cn"
import { useIsHydrated } from "../use-is-hydrated"

type UserInvitation = Invitation & { organizationName?: string }

export type AcceptInvitationProps = {
  className?: string
}

function isPendingInvitation(invitation: UserInvitation | undefined) {
  if (invitation?.status !== "pending") return false

  return new Date(invitation.expiresAt).getTime() > Date.now()
}

/**
 * Render the organization invitation addressed by the `invitationId` query
 * parameter and let the signed-in recipient accept or reject it directly.
 */
export function AcceptInvitation({ className }: AcceptInvitationProps) {
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
    >
      <CardHeader className="grid justify-items-center gap-5 p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted/50">
          <BriefcaseBusiness aria-hidden="true" className="size-7" />
        </div>
        <div className="grid gap-1">
          <CardTitle className="max-w-full break-words text-xl font-semibold">
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : isAvailable ? (
              organizationName
            ) : (
              localization.invitationUnavailable
            )}
          </CardTitle>
          <CardDescription>
            {localization.acceptInvitationTitle}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-6 sm:px-6">
        <div className="grid gap-5 rounded-lg bg-muted/50 p-5">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : isAvailable ? (
            <>
              <FieldDescription>
                {localization.acceptInvitationDescription
                  .replace("{{organization}}", organizationName)
                  .replace("{{role}}", role)}
              </FieldDescription>
              <dl className="grid gap-1">
                <dt className="text-sm text-muted-foreground">
                  {localization.role}
                </dt>
                <dd className="text-base font-medium">{role}</dd>
              </dl>
            </>
          ) : (
            <FieldDescription>
              {localization.invitationUnavailableDescription}
            </FieldDescription>
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
                  <p className="break-all text-sm text-muted-foreground">
                    {session.data.user.email}
                  </p>
                ) : null}
              </div>
            ) : (
              <Skeleton className="h-4 w-40" />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-3 p-4 sm:p-6">
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
              disabled={isAccepting || isRejecting}
              onClick={() => rejectInvitation({ invitationId: invitation.id })}
            >
              {isRejecting ? <Spinner /> : null}
              {localization.rejectInvitation}
            </Button>
            <Button
              className="h-11 w-full"
              disabled={isAccepting || isRejecting}
              onClick={() => acceptInvitation({ invitationId: invitation.id })}
            >
              {isAccepting ? <Spinner /> : null}
              {localization.accept}
            </Button>
          </>
        ) : (
          <Button
            className="col-span-2 h-11 w-full"
            onClick={returnToApplication}
          >
            {localization.return}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
