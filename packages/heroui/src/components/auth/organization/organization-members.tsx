import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveMemberRole,
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
import { type ComponentProps, useEffect, useMemo, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"

/** Props for the {@link OrganizationMembers} component. */
export type OrganizationMembersProps = {
  className?: string
  /**
   * Number of rows per page. This value must be a positive integer. Setting it
   * moves paging, role filtering, and role sorting
   * onto the server, which is what large organizations want: without it the
   * endpoint caps the response at 100 members with no indication.
   *
   * Leave it unset to keep the whole list in memory and filter it in the
   * browser.
   */
  pageSize?: number
}

function validatePageSize(pageSize?: number) {
  if (
    pageSize !== undefined &&
    (!Number.isInteger(pageSize) || pageSize <= 0)
  ) {
    throw new RangeError("pageSize must be a positive integer")
  }

  return pageSize
}

/**
 * Organization members table with title, invite control, and per-row actions.
 */
export function OrganizationMembers({
  className,
  pageSize,
  ...props
}: OrganizationMembersProps & ComponentProps<"div">) {
  const validatedPageSize = validatePageSize(pageSize)
  const { authClient } = useAuth()
  const {
    localization: organizationLocalization,
    membershipLimit,
    roles
  } = useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient as OrganizationAuthClient)

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)

  const paged = validatedPageSize !== undefined

  const { data: membersData, isPending: membersPending } =
    useListOrganizationMembers(authClient as OrganizationAuthClient, {
      query: paged
        ? {
            limit: validatedPageSize,
            offset: page * validatedPageSize,
            ...(roleFilter === "all"
              ? {}
              : {
                  filterField: "role",
                  filterValue: roleFilter,
                  // Roles are stored comma-joined, so an exact match would
                  // drop anyone holding more than one.
                  filterOperator: "contains" as const
                }),
            ...(sortDescriptor?.column === "role"
              ? {
                  sortBy: "role",
                  sortDirection:
                    sortDescriptor.direction === "descending"
                      ? ("desc" as const)
                      : ("asc" as const)
                }
              : {})
          }
        : undefined
    })

  // The signed-in user need not be on the loaded page, so their own role comes
  // from a dedicated endpoint rather than from the member list.
  const { data: activeMemberRole } = useActiveMemberRole(
    authClient as OrganizationAuthClient
  )

  const { isPending: updatePermissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    { permissions: { member: ["update"] } }
  )
  const { isPending: deletePermissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    { permissions: { member: ["delete"] } }
  )

  const isPending =
    activeOrganizationPending ||
    membersPending ||
    updatePermissionPending ||
    deletePermissionPending

  const filteredMembers = useMemo(() => {
    // The server already applied the role filter when paging, and it has no
    // parameter for name or email search, so both stay here only in the
    // unpaged mode where the whole list is present.
    if (paged) return membersData?.members

    return membersData?.members.filter(
      (member) =>
        (roleFilter === "all" || hasMemberRole(member.role, roleFilter)) &&
        (member.user.name.toLowerCase().includes(search.toLowerCase()) ||
          member.user.email.toLowerCase().includes(search.toLowerCase()))
    )
  }, [paged, search, membersData?.members, roleFilter])

  const sortedMembers = useMemo(() => {
    if (paged) return filteredMembers
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
  }, [paged, sortDescriptor, filteredMembers])

  const [inviteOpen, setInviteOpen] = useState(false)

  const total = membersData?.total ?? membersData?.members.length ?? 0

  const membershipLimitReached =
    membershipLimit !== undefined && total >= membershipLimit

  const isOwner = hasMemberRole(activeMemberRole?.role, "owner")

  // Any change to what the server is being asked for invalidates the cursor.
  // biome-ignore lint/correctness/useExhaustiveDependencies: resets on query change
  useEffect(() => {
    setPage(0)
  }, [roleFilter, sortDescriptor, activeOrganization?.id])

  const pageStart = page * (validatedPageSize ?? 0)
  const pageEnd = pageStart + (sortedMembers?.length ?? 0)
  const hasNextPage = pageEnd < total

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-end justify-between gap-3">
        <h3 className="truncate text-sm font-semibold">
          {organizationLocalization.members}
        </h3>

        <Button
          className="shrink-0"
          size="sm"
          isDisabled={isPending || membershipLimitReached}
          onPress={() => setInviteOpen(true)}
        >
          {organizationLocalization.inviteMember}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {/* list-members has no search parameter, so a search box would
              only ever filter the page in front of you. */}
          {!paged && (
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
          )}

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
                {/* Name and email live on the joined user row, which
                    list-members cannot sort by. */}
                <Table.Column allowsSorting={!paged} isRowHeader id="user">
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

        {paged && total > 0 && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted text-sm tabular-nums">
              {organizationLocalization.paginationRange
                .replace("{{from}}", String(pageStart + 1))
                .replace("{{to}}", String(pageEnd))
                .replace("{{total}}", String(total))}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                isDisabled={isPending || page === 0}
                onPress={() => setPage((current) => Math.max(0, current - 1))}
              >
                {organizationLocalization.previousPage}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                isDisabled={isPending || !hasNextPage}
                onPress={() => setPage((current) => current + 1)}
              >
                {organizationLocalization.nextPage}
              </Button>
            </div>
          </div>
        )}
      </div>

      <InviteMemberDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
