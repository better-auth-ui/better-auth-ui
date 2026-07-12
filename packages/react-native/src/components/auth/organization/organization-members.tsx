import {
  type OrganizationAuthClient,
  useActiveOrganization,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useLeaveOrganization,
  useListOrganizationMembers,
  useRemoveMember,
  useSession,
  useUpdateMemberRole
} from "@better-auth-ui/react"
import type { Member, Organization, User } from "better-auth/client"
import { useMemo, useState } from "react"
import { Text, View } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { SearchField } from "../../../primitives/inputs-extra"
import { Menu } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Spinner } from "../../../primitives/spinner"
import { Chip } from "../../../primitives/tabs"
import { toast } from "../../../primitives/toast"
import {
  ArrowRightFromSquare,
  Filter,
  Pencil,
  Trash,
  Xmark
} from "../../../primitives/ui-icons"
import { UserView } from "../user/user-view"
import { InviteMemberDialog } from "./invite-member-dialog"

type OrganizationMember = Member & { user: Partial<User> }

/** Props for the {@link OrganizationMembers} component. */
export type OrganizationMembersProps = SettingsViewProps

/**
 * Organization members list with title, invite control, search/role-filter,
 * and per-row actions (change role, remove/leave). Mirrors the heroui
 * `OrganizationMembers`, adapted for React Native: the sortable `Table`
 * becomes a `Card` of mapped rows with dashed separators (no column sort —
 * a simple filtered list), the role-filter `Dropdown` becomes the RN `Menu`
 * bottom sheet, and `SearchField` is the RN controlled `TextInput` wrapper.
 * Row actions (role-change menu, remove/leave confirm) are composed inline
 * per row since RN has no per-row floating popover.
 */
export function OrganizationMembers({
  className,
  variant
}: OrganizationMembersProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)
  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient as OrganizationAuthClient)
  const { data: membersData, isPending: membersPending } =
    useListOrganizationMembers(authClient as OrganizationAuthClient)

  const { isPending: updatePermissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      permissions: { member: ["update"] }
    }
  )
  const { isPending: deletePermissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      permissions: { member: ["delete"] }
    }
  )

  const isPending =
    activeOrganizationPending ||
    membersPending ||
    updatePermissionPending ||
    deletePermissionPending

  const [roleFilter, setRoleFilter] = useState("all")
  const [roleFilterOpen, setRoleFilterOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredMembers = useMemo(() => {
    return membersData?.members.filter(
      (member) =>
        (roleFilter === "all" || member.role === roleFilter) &&
        (member.user.name.toLowerCase().includes(search.toLowerCase()) ||
          member.user.email.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, membersData?.members, roleFilter])

  const [inviteOpen, setInviteOpen] = useState(false)

  const isOwner = membersData?.members.some(
    (member) => member.role === "owner" && member.userId === session?.user.id
  )

  return (
    <View className={cn("flex-col gap-3", className)}>
      <View className="flex-row items-end justify-between gap-3">
        <Text
          numberOfLines={1}
          className="shrink text-sm font-semibold text-foreground"
        >
          {organizationLocalization.members}
        </Text>

        <Button
          className="shrink-0"
          size="sm"
          isDisabled={isPending}
          onPress={() => setInviteOpen(true)}
        >
          {organizationLocalization.inviteMember}
        </Button>
      </View>

      <View className="flex-col gap-3">
        <View className="flex-row items-center gap-3">
          <SearchField
            className="min-w-0 flex-1"
            aria-label={organizationLocalization.search}
            value={search}
            onChangeText={setSearch}
            placeholder={organizationLocalization.search}
            isDisabled={isPending}
          />

          <Button
            size="sm"
            variant="secondary"
            isDisabled={isPending}
            onPress={() => setRoleFilterOpen(true)}
          >
            <Filter width={16} height={16} />
            {organizationLocalization.role}
          </Button>

          <Menu
            isOpen={roleFilterOpen}
            onOpenChange={setRoleFilterOpen}
            selectedKey={roleFilter}
            onSelect={setRoleFilter}
          >
            <Menu.Item id="all">{organizationLocalization.all}</Menu.Item>

            {Object.entries(roles).map(([role, label]) => (
              <Menu.Item key={role} id={role}>
                {label}
              </Menu.Item>
            ))}
          </Menu>
        </View>

        {roleFilter !== "all" && (
          <Chip className="w-fit flex-row items-center gap-1.5">
            <Chip.Label>
              {organizationLocalization.role}:{" "}
              {roles?.[roleFilter] ?? roleFilter}
            </Chip.Label>

            <Button
              size="sm"
              variant="tertiary"
              isIconOnly
              className="h-4 w-4 p-0"
              aria-label={organizationLocalization.clear}
              onPress={() => setRoleFilter("all")}
            >
              <Xmark width={12} height={12} />
            </Button>
          </Chip>
        )}

        <Card variant={variant}>
          <Card.Content className="gap-0">
            {isPending ? (
              <>
                <OrganizationMemberRowSkeleton />
                <View className="-mx-4 my-4 border-b border-dashed border-border" />
                <OrganizationMemberRowSkeleton />
              </>
            ) : (
              !!activeOrganization &&
              filteredMembers?.map((member, index) => (
                <View key={member.id}>
                  {index > 0 && (
                    <View className="-mx-4 my-4 border-b border-dashed border-border" />
                  )}

                  <OrganizationMemberRow
                    member={member}
                    isOwner={isOwner}
                    organization={activeOrganization}
                  />
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </View>

      <InviteMemberDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />
    </View>
  )
}

/** Placeholder row matching {@link OrganizationMemberRow} while members load. */
function OrganizationMemberRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between gap-2 px-4 py-3">
      <UserView isPending />
      <Skeleton className="h-8 w-8 rounded-full" />
    </View>
  )
}

function OrganizationMemberRow({
  member,
  isOwner,
  organization
}: {
  member: OrganizationMember
  isOwner?: boolean
  organization?: Organization
}) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)
  const colors = useThemeColors()

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
    <View className="flex-row items-center justify-between gap-2">
      <UserView className="min-w-0 flex-1" user={member.user} />

      <Text className="shrink-0 text-sm text-muted">{roleLabel}</Text>

      <View className="shrink-0 flex-row items-center gap-1">
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
      </View>

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
    </View>
  )
}

function RemoveMemberConfirmDialog({
  isOpen,
  onOpenChange,
  member
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  member: OrganizationMember
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
        <Text className="text-sm text-muted">
          {organizationLocalization.removeMemberWarning}
        </Text>

        <Card variant="secondary">
          <Card.Content className="flex-row items-center justify-between gap-2">
            <UserView user={member.user} />

            <Chip>{roles?.[member.role] ?? member.role}</Chip>
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
        <Text className="text-sm text-muted">
          {organizationLocalization.leaveOrganizationDescription}
        </Text>
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
