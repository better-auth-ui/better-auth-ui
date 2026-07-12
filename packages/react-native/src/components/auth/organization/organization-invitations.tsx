import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCancelInvitation,
  useHasPermission,
  useListOrganizationInvitations
} from "@better-auth-ui/react"
import type { Invitation } from "better-auth/client"
import { useMemo, useState } from "react"
import { Text, View } from "react-native"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { formatDateTime } from "../../../lib/format-date"
import { useThemeColors } from "../../../lib/theme-colors"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { SearchField } from "../../../primitives/inputs-extra"
import { Menu } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Spinner } from "../../../primitives/spinner"
import { Chip, EmptyState } from "../../../primitives/tabs"
import { Filter, Send, Xmark } from "../../../primitives/ui-icons"
import { InviteMemberDialog } from "./invite-member-dialog"

type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled"

/** Props for the {@link OrganizationInvitations} component. */
export type OrganizationInvitationsProps = SettingsViewProps

const STATUSES: InvitationStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "canceled"
]

/**
 * Organization invitations list with search/filter controls and per-row
 * cancel action. Mirrors the heroui `OrganizationInvitations`, adapted for
 * React Native: the sortable `Table` becomes a `Card` of mapped rows with
 * dashed separators (no column sort — a simple filtered list), the role/
 * status filter `Dropdown`s become the RN `Menu` bottom sheet, and
 * `SearchField` is the RN controlled `TextInput` wrapper.
 */
export function OrganizationInvitations({
  className,
  variant
}: OrganizationInvitationsProps) {
  const { authClient } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { data: invitations, isPending: invitationsPending } =
    useListOrganizationInvitations(authClient as OrganizationAuthClient)

  const { isPending: invitationPermissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      permissions: { invitation: ["cancel"] }
    }
  )

  const isPending = invitationsPending || invitationPermissionPending

  const [roleFilter, setRoleFilter] = useState("all")
  const [roleFilterOpen, setRoleFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [statusFilterOpen, setStatusFilterOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredInvitations = useMemo(() => {
    return invitations?.filter(
      (invitation) =>
        (roleFilter === "all" || invitation.role === roleFilter) &&
        (statusFilter === "all" || invitation.status === statusFilter) &&
        invitation.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, invitations, roleFilter, statusFilter])

  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <View className={cn("flex-col gap-3", className)}>
      <Text
        numberOfLines={1}
        className="shrink text-sm font-semibold text-foreground"
      >
        {organizationLocalization.invitations}
      </Text>

      <View className="flex-col gap-4">
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

          <Button
            size="sm"
            variant="secondary"
            isDisabled={isPending}
            onPress={() => setStatusFilterOpen(true)}
          >
            <Filter width={16} height={16} />
            {organizationLocalization.status}
          </Button>

          <Menu
            isOpen={statusFilterOpen}
            onOpenChange={setStatusFilterOpen}
            selectedKey={statusFilter}
            onSelect={setStatusFilter}
          >
            <Menu.Item id="all">{organizationLocalization.all}</Menu.Item>

            {STATUSES.map((status) => (
              <Menu.Item key={status} id={status}>
                {organizationLocalization[status] ?? status}
              </Menu.Item>
            ))}
          </Menu>
        </View>

        {(roleFilter !== "all" || statusFilter !== "all") && (
          <View className="flex-row flex-wrap gap-2">
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

            {statusFilter !== "all" && (
              <Chip className="w-fit flex-row items-center gap-1.5">
                <Chip.Label>
                  {organizationLocalization.status}:{" "}
                  {organizationLocalization[statusFilter as InvitationStatus] ??
                    statusFilter}
                </Chip.Label>

                <Button
                  size="sm"
                  variant="tertiary"
                  isIconOnly
                  className="h-4 w-4 p-0"
                  aria-label={organizationLocalization.clear}
                  onPress={() => setStatusFilter("all")}
                >
                  <Xmark width={12} height={12} />
                </Button>
              </Chip>
            )}
          </View>
        )}

        <Card variant={variant}>
          <Card.Content className="gap-0">
            {isPending ? (
              <>
                <OrganizationInvitationRowSkeleton />
                <View className="-mx-4 my-4 border-b border-dashed border-border" />
                <OrganizationInvitationRowSkeleton />
              </>
            ) : !filteredInvitations?.length ? (
              <OrganizationInvitationsEmpty
                onInvitePress={() => setInviteOpen(true)}
              />
            ) : (
              filteredInvitations.map((invitation, index) => (
                <View key={invitation.id}>
                  {index > 0 && (
                    <View className="-mx-4 my-4 border-b border-dashed border-border" />
                  )}

                  <OrganizationInvitationRow invitation={invitation} />
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

function OrganizationInvitationRow({ invitation }: { invitation: Invitation }) {
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
    organizationLocalization[invitation.status as InvitationStatus] ??
    invitation.status

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

function OrganizationInvitationsEmpty({
  onInvitePress
}: {
  onInvitePress: () => void
}) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <EmptyState
      icon={<Send width={18} height={18} />}
      title={organizationLocalization.noInvitations}
      description={
        organizationLocalization.organizationInvitationsEmptyDescription
      }
      action={
        <Button size="sm" onPress={onInvitePress}>
          {organizationLocalization.inviteMember}
        </Button>
      }
    />
  )
}
