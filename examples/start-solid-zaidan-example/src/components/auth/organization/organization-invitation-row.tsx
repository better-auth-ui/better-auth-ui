import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import {
  useCancelInvitation,
  useHasPermission
} from "@better-auth-ui/solid/plugins/organization"
import { X } from "lucide-solid"
import { Show } from "solid-js"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { TableCell, TableRow } from "@/components/ui/table"

type OrganizationInvitation = {
  createdAt?: Date | string | null
  email?: string | null
  id: string
  role?: string | null
  status?: string | null
}

type RoleMap = Record<string, string>

const statusBadgeClasses: Record<string, string> = {
  accepted: "z-badge-status-accepted",
  canceled: "z-badge-status-canceled",
  pending: "z-badge-status-pending",
  rejected: "z-badge-status-rejected"
}

export type OrganizationInvitationRowProps = {
  invitation: OrganizationInvitation
  roles: RoleMap
}

function formatRole(role?: string | null) {
  if (!role) return "Member"

  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatStatus(status?: string | null) {
  if (!status) return "Pending"

  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatInvitationDate(createdAt?: Date | string | null) {
  if (!createdAt) return "—"

  const date = createdAt instanceof Date ? createdAt : new Date(createdAt)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short"
  })
}

export function OrganizationInvitationRow(
  props: OrganizationInvitationRowProps
) {
  const auth = useAuth<OrganizationAuthClient>()
  const permission = useHasPermission(auth.authClient, () => ({
    permissions: { invitation: ["cancel"] }
  }))
  const cancelInvitation = useCancelInvitation(auth.authClient)
  const roleLabel = () =>
    props.roles[props.invitation.role ?? ""] ??
    formatRole(props.invitation.role)
  const statusBadgeClass = () =>
    statusBadgeClasses[props.invitation.status ?? "pending"] ??
    statusBadgeClasses.pending

  return (
    <TableRow>
      <TableCell class="font-medium">
        {props.invitation.email ?? "Invitation"}
      </TableCell>
      <TableCell class="whitespace-nowrap text-muted-foreground text-xs tabular-nums">
        {formatInvitationDate(props.invitation.createdAt)}
      </TableCell>
      <TableCell class="text-sm">{roleLabel()}</TableCell>
      <TableCell>
        <Badge class={statusBadgeClass()} variant="secondary">
          {formatStatus(props.invitation.status)}
        </Badge>
      </TableCell>
      <TableCell class="text-end">
        <Show
          when={
            permission.data?.success && props.invitation.status === "pending"
          }
        >
          <Button
            aria-label="Cancel invitation"
            disabled={cancelInvitation.isPending}
            onClick={() =>
              cancelInvitation.mutate({
                invitationId: props.invitation.id
              })
            }
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <Show
              when={cancelInvitation.isPending}
              fallback={<X class="size-4 text-destructive" />}
            >
              <Spinner class="text-destructive" />
            </Show>
          </Button>
        </Show>
      </TableCell>
    </TableRow>
  )
}
