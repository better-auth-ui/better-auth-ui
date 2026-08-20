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
import type { Member } from "better-auth/client"
import { ChevronUp, Filter, Search, X } from "lucide-react"
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useMemo,
  useState
} from "react"

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

type SortDirection = "ascending" | "descending"

type SortDescriptor = {
  column: string
  direction: SortDirection
}

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
    roles
  } = useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient)

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)

  const paged = validatedPageSize !== undefined

  const { data: membersData, isPending: membersPending } =
    useListOrganizationMembers(authClient, {
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
  const { data: activeMemberRole } = useActiveMemberRole(authClient)

  const { isPending: updatePermissionPending } = useHasPermission(authClient, {
    permissions: { member: ["update"] }
  })
  const { isPending: deletePermissionPending } = useHasPermission(authClient, {
    permissions: { member: ["delete"] }
  })

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

  const isOwner = hasMemberRole(activeMemberRole?.role, "owner")

  const total = membersData?.total ?? membersData?.members.length ?? 0

  const atMembershipLimit =
    membershipLimit !== undefined && total >= membershipLimit

  // Any change to what the server is being asked for invalidates the cursor.
  // biome-ignore lint/correctness/useExhaustiveDependencies: resets on query change
  useEffect(() => {
    setPage(0)
  }, [roleFilter, sortDescriptor, activeOrganization?.id])

  const pageStart = page * (validatedPageSize ?? 0)
  const pageEnd = pageStart + (sortedMembers?.length ?? 0)
  const hasNextPage = pageEnd < total

  function toggleSort(column: string) {
    setSortDescriptor((current) => {
      if (current?.column !== column) {
        return { column, direction: "ascending" }
      }
      if (current.direction === "ascending") {
        return { column, direction: "descending" }
      }
      return undefined
    })
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-end justify-between gap-3">
        <h3 className="truncate text-sm font-semibold">
          {organizationLocalization.members}
        </h3>

        <Button
          className="shrink-0"
          size="sm"
          disabled={isPending || atMembershipLimit}
          onClick={() => setInviteOpen(true)}
        >
          {organizationLocalization.inviteMember}
        </Button>
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
                  <SortableTableHead
                    sortDirection={
                      sortDescriptor?.column === "user"
                        ? sortDescriptor.direction
                        : undefined
                    }
                    onClick={() => toggleSort("user")}
                  >
                    {organizationLocalization.member}
                  </SortableTableHead>
                )}

                <SortableTableHead
                  sortDirection={
                    sortDescriptor?.column === "role"
                      ? sortDescriptor.direction
                      : undefined
                  }
                  onClick={() => toggleSort("role")}
                >
                  {organizationLocalization.role}
                </SortableTableHead>

                <TableHead className="text-end">
                  {organizationLocalization.actions}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
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
            </TableBody>
          </Table>
        </Card>

        {paged && total > 0 && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm tabular-nums">
              {organizationLocalization.paginationRange
                .replace("{{from}}", String(pageStart + 1))
                .replace("{{to}}", String(pageEnd))
                .replace("{{total}}", String(total))}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isPending || page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                {organizationLocalization.previousPage}
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={isPending || !hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                {organizationLocalization.nextPage}
              </Button>
            </div>
          </div>
        )}
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}

function SortableTableHead({
  children,
  sortDirection,
  onClick
}: {
  children: ReactNode
  sortDirection?: SortDirection
  onClick: () => void
}) {
  return (
    <TableHead aria-sort={sortDirection ?? "none"}>
      <Button
        className="h-auto w-full justify-start p-0 font-medium hover:bg-transparent"
        onClick={onClick}
        size="sm"
        type="button"
        variant="ghost"
      >
        {children}

        {!!sortDirection && (
          <ChevronUp
            className={cn(
              "size-3 transition-transform duration-100 ease-out",
              sortDirection === "descending" ? "rotate-180" : ""
            )}
          />
        )}
      </Button>
    </TableHead>
  )
}
