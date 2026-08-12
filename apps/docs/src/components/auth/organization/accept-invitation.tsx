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
import { BriefcaseBusiness, Check, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldDescription } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
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
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader className="gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
          <BriefcaseBusiness className="size-5" />
        </div>

        <CardTitle className="text-xl font-semibold">
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : isAvailable ? (
            localization.acceptInvitationTitle
          ) : (
            localization.invitationUnavailable
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : isAvailable ? (
          <>
            <FieldDescription>
              {localization.acceptInvitationDescription
                .replace("{{organization}}", organizationName)
                .replace("{{role}}", role)}
            </FieldDescription>

            <div className="flex items-center gap-3 rounded-md bg-muted p-3">
              <div className="min-w-0 flex-1 truncate text-sm font-medium">
                {organizationName}
              </div>
              <Badge variant="secondary">{role}</Badge>
            </div>
          </>
        ) : (
          <FieldDescription>
            {localization.invitationUnavailableDescription}
          </FieldDescription>
        )}

        <div className="flex gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </>
          ) : isAvailable && invitation ? (
            <>
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                disabled={isAccepting || isRejecting}
                onClick={() =>
                  rejectInvitation({ invitationId: invitation.id })
                }
              >
                {isRejecting ? <Spinner /> : <X />}
                {localization.rejectInvitation}
              </Button>

              <Button
                className="flex-1"
                type="button"
                disabled={isAccepting || isRejecting}
                onClick={() =>
                  acceptInvitation({ invitationId: invitation.id })
                }
              >
                {isAccepting ? <Spinner /> : <Check />}
                {localization.accept}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              type="button"
              onClick={returnToApplication}
            >
              {localization.return}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
