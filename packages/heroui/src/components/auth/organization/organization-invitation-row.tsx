import {
  memberRoleLabels,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useCancelInvitation,
  useHasPermission,
  useInviteMember
} from "@better-auth-ui/react/plugins/organization"
import { PaperPlane, Xmark } from "@gravity-ui/icons"
import { Button, Chip, Spinner, Table, toast } from "@heroui/react"

import type { Invitation } from "better-auth/client"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"

export type OrganizationInvitationTableRowProps = {
  invitation: Invitation
}

export function OrganizationInvitationTableRow({
  invitation
}: OrganizationInvitationTableRowProps) {
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

  const { data: inviteMemberPermission, isPending: invitePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      permissions: { invitation: ["create"] }
    })

  // Better Auth treats a re-invite as a resend: it extends the existing
  // invitation's expiry and sends the email again rather than creating a
  // second row.
  const { mutate: resendInvitation, isPending: resendPending } =
    useInviteMember(authClient as OrganizationAuthClient, {
      onSuccess: () => toast.success(organizationLocalization.invitationResent)
    })

  const roleLabel = memberRoleLabels(invitation.role, roles).join(", ")

  const statusLabel =
    organizationLocalization[invitation.status] ?? invitation.status

  const statusColor =
    invitation.status === "pending"
      ? "warning"
      : invitation.status === "accepted"
        ? "success"
        : invitation.status === "rejected"
          ? "danger"
          : "default"

  if (cancelPermissionPending || invitePermissionPending) {
    return <OrganizationInvitationRowSkeleton />
  }

  const isPending = invitation.status === "pending"

  return (
    <Table.Row>
      <Table.Cell className="font-medium text-sm">
        {invitation.email}
      </Table.Cell>

      <Table.Cell className="text-muted text-xs tabular-nums whitespace-nowrap">
        {new Date(invitation.createdAt).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short"
        })}
      </Table.Cell>

      <Table.Cell className="text-sm">{roleLabel}</Table.Cell>

      <Table.Cell className="text-sm">
        <Chip color={statusColor} size="sm" variant="soft">
          {statusLabel}
        </Chip>
      </Table.Cell>

      <Table.Cell className="text-end">
        <div className="flex justify-end gap-2">
          {inviteMemberPermission?.success && isPending && (
            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              isPending={resendPending}
              onPress={() =>
                resendInvitation({
                  email: invitation.email,
                  organizationId: invitation.organizationId,
                  role: invitation.role as Parameters<
                    typeof resendInvitation
                  >[0]["role"],
                  resend: true
                })
              }
              aria-label={organizationLocalization.resendInvitation}
            >
              {resendPending ? (
                <Spinner color="current" size="sm" />
              ) : (
                <PaperPlane />
              )}
            </Button>
          )}

          {cancelInvitationPermission?.success && isPending && (
            <Button
              isIconOnly
              size="sm"
              variant="danger-soft"
              isPending={cancelPending}
              onPress={() => cancelInvitation({ invitationId: invitation.id })}
              aria-label={organizationLocalization.cancelInvitation}
            >
              {cancelPending ? (
                <Spinner color="current" size="sm" />
              ) : (
                <Xmark />
              )}
            </Button>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  )
}
