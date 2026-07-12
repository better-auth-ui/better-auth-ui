import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCancelInvitation,
  useHasPermission
} from "@better-auth-ui/react"
import type { Invitation } from "better-auth/client"
import { Text, View } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { formatDateTime } from "../../../lib/format-date"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
import { Skeleton } from "../../../primitives/skeleton"
import { Spinner } from "../../../primitives/spinner"
import { Chip } from "../../../primitives/tabs"
import { Xmark } from "../../../primitives/ui-icons"

export type OrganizationInvitationRowProps = {
  invitation: Invitation
}

/** Placeholder row matching {@link OrganizationInvitationRow} while invitations load. */
function OrganizationInvitationRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between gap-2 px-4 py-3">
      <View className="min-w-0 flex-1 gap-1.5">
        <Skeleton className="h-4 w-48 rounded-lg" />
        <Skeleton className="h-3 w-36 rounded-lg" />
      </View>

      <Skeleton className="h-5 w-14 rounded-full" />
    </View>
  )
}

/**
 * Single organization-scoped invitation row: email + created-at/role
 * subtitle, a status `Chip`, and a per-row cancel action. Mirrors the heroui
 * `OrganizationInvitationTableRow`, adapted for React Native: the `Table.Row`/
 * `Table.Cell` grid becomes a horizontally laid-out `View` row (no table
 * primitive on RN), the `Chip` uses the RN color-variant primitive, and the
 * cancel button renders the RN `Spinner`/icon pair instead of the heroui
 * `isIconOnly` button icon swap.
 */
export function OrganizationInvitationRow({
  invitation
}: OrganizationInvitationRowProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

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
    <View className="flex-row items-center justify-between gap-2">
      <View className="min-w-0 flex-1 gap-1">
        <Text numberOfLines={1} className="text-sm font-medium text-foreground">
          {invitation.email}
        </Text>

        <Text numberOfLines={1} className="text-xs text-muted">
          {formatDateTime(invitation.createdAt)} · {roleLabel}
        </Text>
      </View>

      <Chip color={statusColor} className="shrink-0">
        {statusLabel}
      </Chip>

      {cancelInvitationPermission?.success &&
        invitation.status === "pending" && (
          <Button
            isIconOnly
            size="sm"
            variant="danger"
            isPending={cancelPending}
            onPress={() => cancelInvitation({ invitationId: invitation.id })}
            aria-label={organizationLocalization.cancelInvitation}
          >
            {cancelPending ? (
              <Spinner color="current" size="sm" />
            ) : (
              <Xmark width={16} height={16} color={colors.danger} />
            )}
          </Button>
        )}
    </View>
  )
}
