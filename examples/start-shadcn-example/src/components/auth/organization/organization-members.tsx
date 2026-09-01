"use client"

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
import type { PaginationState, SortingState } from "@tanstack/react-table"
import type { Member, User } from "better-auth/client"
import { Filter, Search, X } from "lucide-react"
import { type ComponentProps, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"
import { OrganizationSortableTableHead } from "./organization-sortable-table-head"
import {
  createOrganizationColumnHelper,
  ORGANIZATION_TABLE_PAGE_SIZE,
  useOrganizationTable
} from "./organization-table"
import { OrganizationTablePagination } from "./organization-table-pagination"

type MemberRow = Member & { user: Partial<User> }

const memberColumnHelper = createOrganizationColumnHelper<MemberRow>()
const memberColumns = memberColumnHelper.columns([
  memberColumnHelper.accessor(
    (member) => member.user.name || member.user.email || "",
    { id: "user" }
  ),
  memberColumnHelper.accessor("role", {})
])
const EMPTY_MEMBERS: MemberRow[] = []

/** Props for the `OrganizationMembers` component. */
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
  const { authClient } = useAuth<OrganizationAuthClient>()
  const {
    localization: organizationLocalization,
    membershipLimit,
    roles,
    creatorRole,
    teams
  } = useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient)

  const [sorting, setSorting] = useState<SortingState>([])
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: validatedPageSize ?? ORGANIZATION_TABLE_PAGE_SIZE
  })

  const paged = validatedPageSize !== undefined

  const { data: membersData, isPending: membersPending } =
    useListOrganizationMembers(authClient, {
      query: paged
        ? {
            limit: validatedPageSize,
            offset: pagination.pageIndex * validatedPageSize,
            ...(roleFilter === "all"
              ? {}
              : {
                  filterField: "role",
                  filterValue: roleFilter,
                  // Roles are stored comma-joined, so an exact match would
                  // drop anyone holding more than one.
                  filterOperator: "contains" as const
                }),
            ...(sorting[0]?.id === "role"
              ? {
                  sortBy: "role",
                  sortDirection: sorting[0].desc
                    ? ("desc" as const)
                    : ("asc" as const)
                }
              : {})
          }
        : undefined
    })

  // The signed-in user need not be on the loaded page, so their own role comes
  // from a dedicated endpoint rather than from the member list.
  const { data: activeMemberRole } = useActiveMemberRole(authClient)
  const owners = useListOrganizationMembers(authClient, {
    query: {
      organizationId: activeOrganization?.id,
      filterField: "role",
      filterValue: creatorRole,
      filterOperator: "contains",
      limit: 1
    },
    enabled: Boolean(activeOrganization?.id)
  })

  const canInvite = useHasPermission(authClient, {
    permissions: { invitation: ["create"] }
  })
  const canListMemberTeams = useHasPermission(authClient, {
    organizationId: activeOrganization?.id,
    permissions: { member: ["update"] },
    enabled: teams && Boolean(activeOrganization?.id)
  })

  const isPending =
    activeOrganizationPending ||
    membersPending ||
    owners.isPending ||
    (teams && canListMemberTeams.isPending)

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

  const [inviteOpen, setInviteOpen] = useState(false)

  const isOwner = hasMemberRole(activeMemberRole?.role, creatorRole)
  const ownerCount = owners.data?.total ?? owners.data?.members.length
  const showTeams = teams && canListMemberTeams.data?.success === true

  const total = membersData?.total ?? membersData?.members.length ?? 0

  const table = useOrganizationTable({
    columns: memberColumns,
    data: filteredMembers ?? EMPTY_MEMBERS,
    getRowId: (member) => member.id,
    manualPagination: paged,
    manualSorting: paged,
    rowCount: paged ? total : undefined,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting
  })

  const atMembershipLimit =
    membershipLimit !== undefined && total >= membershipLimit

  // Any change to what the server is being asked for invalidates the cursor.
  // biome-ignore lint/correctness/useExhaustiveDependencies: resets on query change
  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }, [roleFilter, sorting, activeOrganization?.id])

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-end justify-between gap-3">
        <h3 className="truncate text-sm font-semibold">
          {organizationLocalization.members}
        </h3>

        {(canInvite.isPending || canInvite.data?.success) && (
          <Button
            className="shrink-0"
            size="sm"
            disabled={canInvite.isPending || atMembershipLimit}
            onClick={() => setInviteOpen(true)}
          >
            {organizationLocalization.inviteMember}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {/* list-members has no search parameter, so a search box would
              only ever filter the page in front of you. */}
          {!paged && (
            <InputGroup className="min-w-0 sm:w-[220px]">
              <InputGroupInput
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={organizationLocalization.search}
                placeholder={organizationLocalization.search}
                disabled={isPending}
              />

              <InputGroupAddon>
                <Search className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              disabled={isPending}
            >
              <Filter />

              {organizationLocalization.role}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <DropdownMenuRadioItem value="all">
                  {organizationLocalization.all}
                </DropdownMenuRadioItem>

                {Object.entries(roles).map(([role, label]) => (
                  <DropdownMenuRadioItem key={role} value={role}>
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {roleFilter !== "all" && (
          <Badge variant="secondary" className="w-fit gap-1">
            {organizationLocalization.role}:{" "}
            <span className="capitalize">
              {roles?.[roleFilter] ?? roleFilter}
            </span>
            <Button
              aria-label={organizationLocalization.clear}
              className="size-4 rounded-sm text-muted-foreground"
              onClick={() => setRoleFilter("all")}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <X className="size-3" />
            </Button>
          </Badge>
        )}

        <Card className="p-0">
          <Table aria-label={organizationLocalization.members}>
            <TableHeader>
              <TableRow>
                {/* Name and email live on the joined user row, which
                    list-members cannot sort by. */}
                {paged ? (
                  <TableHead>{organizationLocalization.member}</TableHead>
                ) : (
                  <OrganizationSortableTableHead
                    column={table.getColumn("user")}
                  >
                    {organizationLocalization.member}
                  </OrganizationSortableTableHead>
                )}

                <OrganizationSortableTableHead column={table.getColumn("role")}>
                  {organizationLocalization.role}
                </OrganizationSortableTableHead>

                {showTeams && (
                  <TableHead>{organizationLocalization.teams}</TableHead>
                )}

                <TableHead className="text-end">
                  {organizationLocalization.actions}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                <OrganizationMemberRowSkeleton showTeams={showTeams} />
              ) : (
                !!activeOrganization &&
                table
                  .getRowModel()
                  .rows.map(({ original: member }) => (
                    <OrganizationMemberRow
                      key={member.id}
                      member={member}
                      isOwner={isOwner}
                      ownerCount={ownerCount}
                      organization={activeOrganization}
                      showTeams={showTeams}
                    />
                  ))
              )}
            </TableBody>
          </Table>
        </Card>

        <OrganizationTablePagination
          canNextPage={table.getCanNextPage()}
          canPreviousPage={table.getCanPreviousPage()}
          disabled={isPending}
          localization={organizationLocalization}
          onNextPage={table.nextPage}
          onPreviousPage={table.previousPage}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          rowCount={table.getRowCount()}
          visibleRowCount={table.getRowModel().rows.length}
        />
      </div>

      {canInvite.data?.success && (
        <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      )}
    </div>
  )
}
