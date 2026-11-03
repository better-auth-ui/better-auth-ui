"use client"
import type { ReactNode } from "react"
import { formatAdditionalFieldValue } from "@better-auth-ui/core"
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
import type { Invitation } from "better-auth/client"
import { Send, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { TableCell, TableRow } from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "cn"
import { OrganizationTableRowSkeleton } from "./organization-table-row-skeleton"
import {
  type OrganizationSelectableRow,
  OrganizationTableSelectRow
} from "./organization-table-selection"
export type OrganizationInvitationRowProps = {
  columnIds: readonly string[]
  invitation: Invitation
  selectableRow?: OrganizationSelectableRow<Invitation>
}
const statusBadgeClasses: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground"
}
export function OrganizationInvitationRow({
  columnIds,
  invitation,
  selectableRow
}: OrganizationInvitationRowProps) {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const {
    modelFields: { invitation: invitationFields },
    localization: organizationLocalization,
    roles
  } = useAuthPlugin(organizationPlugin)
  const {
    data: cancelInvitationPermission,
    isPending: cancelPermissionPending
  } = useHasPermission(authClient, {
    permissions: { invitation: ["cancel"] }
  })
  const { mutate: cancelInvitation, isPending: cancelPending } =
    useCancelInvitation(authClient)
  const { data: inviteMemberPermission, isPending: invitePermissionPending } =
    useHasPermission(authClient, {
      permissions: { invitation: ["create"] }
    })
  // Better Auth treats a re-invite as a resend: it extends the existing
  // invitation's expiry and sends the email again rather than creating a
  // second row.
  const { mutate: resendInvitation, isPending: resendPending } =
    useInviteMember(authClient, {
      onSuccess: () => toast.success(organizationLocalization.invitationResent)
    })
  const roleLabel = memberRoleLabels(invitation.role, roles).join(", ")
  const statusLabel =
    organizationLocalization[
      invitation.status as keyof typeof organizationLocalization
    ] ?? invitation.status
  if (cancelPermissionPending || invitePermissionPending) {
    return <OrganizationTableRowSkeleton columnIds={columnIds} />
  }
  const isPending = invitation.status === "pending"
  const cells: Record<string, ReactNode> = {
    select: selectableRow && (
      <TableCell key="select">
        <OrganizationTableSelectRow
          localization={organizationLocalization}
          row={selectableRow}
        />
      </TableCell>
    ),
    email: (
      <TableCell key="email">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">{invitation.email}</span>
          {invitationFields.map((field) => {
            const value = formatAdditionalFieldValue(
              (invitation as unknown as Record<string, unknown>)[field.name]
            )
            return value ? (
              <span className="text-xs text-muted-foreground" key={field.name}>
                {field.label}: {value}
              </span>
            ) : null
          })}
        </div>
      </TableCell>
    ),
    createdAt: (
      <TableCell
        key="createdAt"
        className="text-muted-foreground text-xs tabular-nums whitespace-nowrap"
      >
        {new Date(invitation.createdAt).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short"
        })}
      </TableCell>
    ),
    role: (
      <TableCell key="role" className="text-sm">
        {roleLabel}
      </TableCell>
    ),
    status: (
      <TableCell key="status" className="text-sm">
        <Badge
          variant="secondary"
          className={cn(statusBadgeClasses[invitation.status])}
        >
          {String(statusLabel)}
        </Badge>
      </TableCell>
    ),
    actions: (
      <TableCell key="actions" className="text-end">
        <div className="flex justify-end gap-2">
          {inviteMemberPermission?.success && isPending && (
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              isDisabled={resendPending}
              onPress={() =>
                resendInvitation({
                  ...Object.fromEntries(
                    invitationFields.flatMap((field) => {
                      const value = (
                        invitation as unknown as Record<string, unknown>
                      )[field.name]
                      return value === undefined ? [] : [[field.name, value]]
                    })
                  ),
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
              {resendPending ? <Spinner /> : <Send />}
            </Button>
          )}

          {cancelInvitationPermission?.success && isPending && (
            <Button
              size="icon"
              variant="outline"
              className="size-8 text-destructive"
              isDisabled={cancelPending}
              onPress={() => cancelInvitation({ invitationId: invitation.id })}
              aria-label={organizationLocalization.cancelInvitation}
            >
              {cancelPending ? <Spinner /> : <X />}
            </Button>
          )}
        </div>
      </TableCell>
    )
  }
  return (
    <TableRow
      data-state={selectableRow?.getIsSelected() ? "selected" : undefined}
    >
      {columnIds.map((id) => cells[id])}
    </TableRow>
  )
}
