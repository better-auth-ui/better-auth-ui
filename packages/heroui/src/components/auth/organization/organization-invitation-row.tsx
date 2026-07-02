import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useCancelInvitation,
  useHasPermission
} from "@better-auth-ui/react/plugins/organization"
import { Xmark } from "@gravity-ui/icons"
import { Button, Chip, Spinner, Table } from "@heroui/react"

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

  const roleLabel = roles?.[invitation.role] ?? invitation.role

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

  if (cancelPermissionPending) {
    return <OrganizationInvitationRowSkeleton />
  }

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
        {cancelInvitationPermission?.success &&
          invitation.status === "pending" && (
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
      </Table.Cell>
    </Table.Row>
  )
}
