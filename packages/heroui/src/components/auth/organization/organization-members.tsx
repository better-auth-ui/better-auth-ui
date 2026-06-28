import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission,
  useListOrganizationMembers
} from "@better-auth-ui/react/plugins/organization"
import { Funnel, Xmark } from "@gravity-ui/icons"
import {
  Button,
  Chip,
  cn,
  Dropdown,
  Label,
  SearchField,
  type SortDescriptor,
  Table
} from "@heroui/react"
import type { Member } from "better-auth/client"
import { type ComponentProps, useMemo, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"

/** Props for the {@link OrganizationMembers} component. */
export type OrganizationMembersProps = {
  className?: string
}

/**
 * Organization members table with title, invite control, and per-row actions.
 */
export function OrganizationMembers({
  className,
  ...props
}: OrganizationMembersProps & ComponentProps<"div">) {
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

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filteredMembers = useMemo(() => {
    return membersData?.members.filter(
      (member) =>
        (roleFilter === "all" || member.role === roleFilter) &&
        (member.user.name.toLowerCase().includes(search.toLowerCase()) ||
          member.user.email.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, membersData?.members, roleFilter])

  const sortedMembers = useMemo(() => {
    if (!sortDescriptor) return filteredMembers
    if (!filteredMembers) return filteredMembers

    return [...filteredMembers].sort((a, b) => {
      const col = sortDescriptor.column as keyof Member | "user"
      const first =
        col === "user" ? a.user.name || a.user.email : String(a[col])
      const second =
        col === "user" ? b.user.name || b.user.email : String(b[col])

      let cmp = first.localeCompare(second)
      if (sortDescriptor.direction === "descending") {
        cmp *= -1
      }

      return cmp
    })
  }, [sortDescriptor, filteredMembers])

  const [inviteOpen, setInviteOpen] = useState(false)

  const isOwner = membersData?.members.some(
    (member) => member.role === "owner" && member.userId === session?.user.id
  )

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-end justify-between gap-3">
        <h3 className="truncate text-sm font-semibold">
          {organizationLocalization.members}
        </h3>

        <Button
          className="shrink-0"
          size="sm"
          isDisabled={isPending}
          onPress={() => setInviteOpen(true)}
        >
          {organizationLocalization.inviteMember}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <SearchField
            className="min-w-0"
            aria-label={organizationLocalization.search}
            value={search}
            onChange={setSearch}
            isDisabled={isPending}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />

              <SearchField.Input
                placeholder={organizationLocalization.search}
                className="sm:w-[200px]"
              />

              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <Dropdown>
            <Button size="sm" variant="secondary" isDisabled={isPending}>
              <Funnel />

              {organizationLocalization.role}
            </Button>

            <Dropdown.Popover>
              <Dropdown.Menu
                selectionMode="single"
                selectedKeys={new Set([roleFilter])}
                onSelectionChange={(keys) => {
                  const key = [...keys][0] as string | undefined
                  setRoleFilter(key ?? "all")
                }}
              >
                <Dropdown.Item
                  id="all"
                  textValue={organizationLocalization.all}
                >
                  <Label>{organizationLocalization.all}</Label>

                  <Dropdown.ItemIndicator />
                </Dropdown.Item>

                {Object.entries(roles).map(([role, label]) => (
                  <Dropdown.Item key={role} id={role} textValue={label}>
                    <Label>{label}</Label>

                    <Dropdown.ItemIndicator />
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        {roleFilter !== "all" && (
          <Chip size="sm" variant="secondary" className="w-fit">
            <Chip.Label>
              {organizationLocalization.role}:{" "}
              <span className="capitalize">
                {roles?.[roleFilter] ?? roleFilter}
              </span>
            </Chip.Label>

            <button
              type="button"
              aria-label={organizationLocalization.clear}
              className="text-muted hover:text-foreground inline-flex cursor-pointer items-center"
              onClick={() => setRoleFilter("all")}
            >
              <Xmark className="size-3" />
            </button>
          </Chip>
        )}

        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label={organizationLocalization.members}
              sortDescriptor={sortDescriptor}
              onSortChange={(descriptor) => {
                const shouldReset =
                  sortDescriptor?.column === descriptor.column &&
                  descriptor.direction === "ascending"
                setSortDescriptor(shouldReset ? undefined : descriptor)
              }}
            >
              <Table.Header>
                <Table.Column allowsSorting isRowHeader id="user">
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {organizationLocalization.member}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>

                <Table.Column allowsSorting id="role">
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {organizationLocalization.role}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>

                <Table.Column className="text-end">
                  {organizationLocalization.actions}
                </Table.Column>
              </Table.Header>

              <Table.Body>
                {isPending ? (
                  <OrganizationMemberRowSkeleton />
                ) : (
                  !!activeOrganization &&
                  sortedMembers?.map((member) => (
                    <OrganizationMemberRow
                      key={member.id}
                      member={member}
                      isOwner={isOwner}
                      organization={activeOrganization}
                    />
                  ))
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      <InviteMemberDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
