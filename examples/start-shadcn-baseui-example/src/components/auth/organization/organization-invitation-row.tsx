"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCancelInvitation,
  useHasPermission
} from "@better-auth-ui/react"
import type { Invitation } from "better-auth/client"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { TableCell, TableRow } from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"

export type OrganizationInvitationRowProps = {
  invitation: Invitation
}

const statusBadgeClasses: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground"
}

export function OrganizationInvitationRow({
  invitation
}: OrganizationInvitationRowProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const {
    data: cancelInvitationPermission,
    isPending: cancelPermissionPending
  } = useHasPermission(authClient as OrganizationAuthClient, {
    permissions: { invitation: ["cancel"] }
  })

  const { mutate: cancelInvitation, isPending: cancelPending } =
    useCancelInvitation(authClient as OrganizationAuthClient)

  const roleLabel = roles?.[invitation.role] ?? invitation.role

  const statusLabel =
    organizationLocalization[
      invitation.status as keyof typeof organizationLocalization
    ] ?? invitation.status

  if (cancelPermissionPending) {
    return <OrganizationInvitationRowSkeleton />
  }

  return (
    <TableRow>
      <TableCell className="font-medium text-sm">{invitation.email}</TableCell>

      <TableCell className="text-muted-foreground text-xs tabular-nums whitespace-nowrap">
        {new Date(invitation.createdAt).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short"
        })}
      </TableCell>

      <TableCell className="text-sm">{roleLabel}</TableCell>

      <TableCell className="text-sm">
        <Badge
          variant="secondary"
          className={cn(statusBadgeClasses[invitation.status])}
        >
          {String(statusLabel)}
        </Badge>
      </TableCell>

      <TableCell className="text-end">
        {cancelInvitationPermission?.success &&
          invitation.status === "pending" && (
            <Button
              size="icon"
              variant="outline"
              className="size-8 text-destructive"
              disabled={cancelPending}
              onClick={() => cancelInvitation({ invitationId: invitation.id })}
              aria-label={organizationLocalization.cancelInvitation}
            >
              {cancelPending ? <Spinner /> : <X />}
            </Button>
          )}
      </TableCell>
    </TableRow>
  )
}
