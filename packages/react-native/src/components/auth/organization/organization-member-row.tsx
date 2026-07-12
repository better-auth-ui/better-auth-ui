import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useLeaveOrganization,
  useRemoveMember,
  useSession,
  useUpdateMemberRole
} from "@better-auth-ui/react"
import type { Member, Organization, User } from "better-auth/client"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Menu } from "../../../primitives/menu"
import { Spinner } from "../../../primitives/spinner"
import { Box, Txt } from "../../../primitives/styled"
import { Chip } from "../../../primitives/tabs"
import { toast } from "../../../primitives/toast"
import {
  ArrowRightFromSquare,
  Pencil,
  Trash
} from "../../../primitives/ui-icons"
import { UserView } from "../user/user-view"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"

export type OrganizationMemberRowProps = {
  member: Member & { user: Partial<User> }
  isOwner?: boolean
  organization: Organization
}

/**
 * A single member list row: `UserView` + role label, a row-scoped Menu to
 * change the member's role (gated by `member:update` permission), and either
 * a "leave organization" action (when the row is the current user) or a
 * "remove member" action (gated by `member:delete` permission). Mirrors the
 * heroui `OrganizationMemberRow`, adapted for React Native: `Table.Row`/
 * `.Cell` become a plain `View` row (the enclosing list supplies dashed
 * separators between rows), the per-row `Dropdown` role-change menu becomes
 * the RN `Menu` bottom sheet, and `RemoveMemberDialog`/`LeaveOrganizationDialog`
 * are inlined as controlled `AlertDialog`s rather than separate files.
 */
export function OrganizationMemberRow({
  member,
  isOwner,
  organization
}: OrganizationMemberRowProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)

  const { data: hasUpdatePermission, isPending: updatePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      permissions: { member: ["update"] }
    })

  const { data: hasDeletePermission, isPending: deletePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      permissions: { member: ["delete"] }
    })

  const isPending = updatePermissionPending || deletePermissionPending

  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateMemberRole(authClient as OrganizationAuthClient, {
      onSuccess: () => toast.success(organizationLocalization.memberRoleUpdated)
    })

  const roleLabel = roles?.[member.role] ?? member.role

  const assignableRoles = Object.entries(roles).filter(
    ([key]) => isOwner || key !== "owner"
  )

  const isCurrentUser = session?.user.id === member.userId

  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  if (isPending) {
    return <OrganizationMemberRowSkeleton />
  }

  return (
    <Box className="flex-row items-center justify-between gap-2">
      <UserView className="min-w-0 flex-1" user={member.user} />

      <Txt className="shrink-0 text-sm text-muted">{roleLabel}</Txt>

      <Box className="shrink-0 flex-row items-center gap-1">
        {hasUpdatePermission?.success && (
          <Button
            isIconOnly
            size="sm"
            variant="tertiary"
            isDisabled={isUpdatingRole}
            aria-label={organizationLocalization.changeMemberRole}
            onPress={() => setRoleMenuOpen(true)}
          >
            {isUpdatingRole ? (
              <Spinner color="current" size="sm" />
            ) : (
              <Pencil width={16} height={16} />
            )}
          </Button>
        )}

        {isCurrentUser ? (
          <Button
            isIconOnly
            size="sm"
            variant="danger"
            aria-label={organizationLocalization.leaveOrganization}
            onPress={() => setLeaveOpen(true)}
          >
            <ArrowRightFromSquare width={16} height={16} />
          </Button>
        ) : (
          hasDeletePermission?.success && (
            <Button
              isIconOnly
              size="sm"
              variant="danger"
              aria-label={organizationLocalization.removeMember}
              onPress={() => setRemoveOpen(true)}
            >
              <Trash width={16} height={16} />
            </Button>
          )
        )}
      </Box>

      <Menu
        isOpen={roleMenuOpen}
        onOpenChange={setRoleMenuOpen}
        selectedKey={member.role}
        onSelect={(role) => updateMemberRole({ memberId: member.id, role })}
      >
        {assignableRoles.map(([role, label]) => (
          <Menu.Item key={role} id={role} isDisabled={member.role === role}>
            {label}
          </Menu.Item>
        ))}
      </Menu>

      {isCurrentUser && organization ? (
        <LeaveOrganizationConfirmDialog
          isOpen={leaveOpen}
          onOpenChange={setLeaveOpen}
          organization={organization}
        />
      ) : (
        hasDeletePermission?.success && (
          <RemoveMemberConfirmDialog
            isOpen={removeOpen}
            onOpenChange={setRemoveOpen}
            member={member}
          />
        )
      )}
    </Box>
  )
}

function RemoveMemberConfirmDialog({
  isOpen,
  onOpenChange,
  member
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  member: Member & { user: Partial<User> }
}) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

  const { mutate: removeMember, isPending } = useRemoveMember(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.memberRemoved)
      }
    }
  )

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />

      <AlertDialog.Header>
        <AlertDialog.Icon status="danger">
          <Trash width={20} height={20} color={colors.danger} />
        </AlertDialog.Icon>

        <AlertDialog.Heading>
          {organizationLocalization.removeMember}
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body>
        <Txt className="text-sm text-muted">
          {organizationLocalization.removeMemberWarning}
        </Txt>

        <Card variant="secondary">
          <Card.Content className="flex-row items-center justify-between gap-2">
            <UserView user={member.user} />

            <Chip>
              <Chip.Label>{roles?.[member.role] ?? member.role}</Chip.Label>
            </Chip>
          </Card.Content>
        </Card>
      </AlertDialog.Body>

      <AlertDialog.Footer>
        <Button
          variant="tertiary"
          isDisabled={isPending}
          onPress={() => onOpenChange(false)}
        >
          {localization.settings.cancel}
        </Button>

        <Button
          variant="danger"
          isPending={isPending}
          onPress={() =>
            removeMember({
              memberIdOrEmail: member.id,
              organizationId: member.organizationId
            })
          }
        >
          {organizationLocalization.removeMember}
        </Button>
      </AlertDialog.Footer>
    </AlertDialog>
  )
}

function LeaveOrganizationConfirmDialog({
  isOpen,
  onOpenChange,
  organization
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
}) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

  const { mutate: leaveOrganization, isPending } = useLeaveOrganization(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.leftOrganization)
      }
    }
  )

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.CloseTrigger />

      <AlertDialog.Header>
        <AlertDialog.Icon status="danger">
          <ArrowRightFromSquare width={20} height={20} color={colors.danger} />
        </AlertDialog.Icon>

        <AlertDialog.Heading>
          {organizationLocalization.leaveOrganization}
        </AlertDialog.Heading>
      </AlertDialog.Header>

      <AlertDialog.Body>
        <Txt className="text-sm text-muted">
          {organizationLocalization.leaveOrganizationDescription}
        </Txt>
      </AlertDialog.Body>

      <AlertDialog.Footer>
        <Button
          variant="tertiary"
          isDisabled={isPending}
          onPress={() => onOpenChange(false)}
        >
          {localization.settings.cancel}
        </Button>

        <Button
          variant="danger"
          isPending={isPending}
          onPress={() => leaveOrganization({ organizationId: organization.id })}
        >
          {organizationLocalization.leaveOrganization}
        </Button>
      </AlertDialog.Footer>
    </AlertDialog>
  )
}
