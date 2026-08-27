import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission,
  useListOrganizationMembers
} from "@better-auth-ui/react/plugins/organization"
import { useMemo, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { cn } from "../../../lib/cn"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { SearchField } from "../../../primitives/inputs-extra"
import { Menu } from "../../../primitives/menu"
import { Box, Txt } from "../../../primitives/styled"
import { Chip } from "../../../primitives/tabs"
import { Filter, Xmark } from "../../../primitives/ui-icons"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"

/** Props for the {@link OrganizationMembers} component. */
export type OrganizationMembersProps = SettingsViewProps

/**
 * Organization members list with title, invite control, search/role-filter,
 * and per-row actions (change role, remove/leave). Mirrors the heroui
 * `OrganizationMembers`, adapted for React Native: the sortable `Table`
 * becomes a `Card` of mapped rows with dashed separators (no column sort —
 * a simple filtered list), the role-filter `Dropdown` becomes the RN `Menu`
 * bottom sheet, and `SearchField` is the RN controlled `TextInput` wrapper.
 * The row itself (role-change menu, remove/leave confirm) lives in
 * `OrganizationMemberRow`, mirroring heroui's file split.
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
    <Box className={cn("flex-col gap-3", className)}>
      <Box className="flex-row items-end justify-between gap-3">
        <Txt
          numberOfLines={1}
          className="shrink text-sm font-semibold text-foreground"
        >
          {organizationLocalization.members}
        </Txt>

        <Button
          className="shrink-0"
          size="sm"
          isDisabled={isPending}
          onPress={() => setInviteOpen(true)}
        >
          {organizationLocalization.inviteMember}
        </Button>
      </Box>

      <Box className="flex-col gap-3">
        <Box className="flex-row items-center gap-3">
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
        </Box>

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
                <Box className="-mx-4 my-4 border-b border-dashed border-border" />
                <OrganizationMemberRowSkeleton />
              </>
            ) : (
              !!activeOrganization &&
              filteredMembers?.map((member, index) => (
                <Box key={member.id}>
                  {index > 0 && (
                    <Box className="-mx-4 my-4 border-b border-dashed border-border" />
                  )}

                  <OrganizationMemberRow
                    member={member}
                    isOwner={isOwner}
                    organization={activeOrganization}
                  />
                </Box>
              ))
            )}
          </Card.Content>
        </Card>
      </Box>

      <InviteMemberDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />
    </Box>
  )
}
