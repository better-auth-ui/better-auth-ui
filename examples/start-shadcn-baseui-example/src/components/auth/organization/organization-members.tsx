"use client"

import {
  type OrganizationAuthClient,
  useActiveOrganization,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useListOrganizationMembers,
  useSession
} from "@better-auth-ui/react"
import type { Column, RowData } from "@tanstack/react-table"
import { useTable } from "@tanstack/react-table"
import type { Member, User } from "better-auth/client"
import { ChevronUp, Filter, Search, X } from "lucide-react"
import { type ComponentProps, type ReactNode, useMemo, useState } from "react"

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
import {
  createOrganizationColumnHelper,
  ORGANIZATION_TABLE_PAGE_SIZE,
  organizationTableFeatures
} from "@/lib/table/organization-table-features"
import { cn } from "@/lib/utils"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"
import { OrganizationTablePagination } from "./organization-table-pagination"

type MemberRow = Member & { user: Partial<User> }

const EMPTY_MEMBERS: MemberRow[] = []

const columnHelper = createOrganizationColumnHelper<MemberRow>()

const memberColumns = columnHelper.columns([
  columnHelper.accessor((member) => member.user.name || member.user.email, {
    id: "user",
    sortFn: "alphanumeric"
  }),
  columnHelper.accessor("role", { sortFn: "alphanumeric" })
])

/** Props for the `OrganizationMembers` component. */
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

  const table = useTable({
    columns: memberColumns,
    data: filteredMembers ?? EMPTY_MEMBERS,
    features: organizationTableFeatures,
    getRowId: (member) => member.id,
    initialState: {
      pagination: { pageIndex: 0, pageSize: ORGANIZATION_TABLE_PAGE_SIZE }
    }
  })

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
          disabled={isPending}
          onClick={() => setInviteOpen(true)}
        >
          {organizationLocalization.inviteMember}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
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
                <SortableTableHead column={table.getColumn("user")}>
                  {organizationLocalization.member}
                </SortableTableHead>

                <SortableTableHead column={table.getColumn("role")}>
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
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <OrganizationMemberRow
                      key={row.id}
                      member={row.original}
                      isOwner={isOwner}
                      organization={activeOrganization}
                    />
                  ))
              )}
            </TableBody>
          </Table>
        </Card>

        <OrganizationTablePagination
          table={table}
          localization={organizationLocalization}
        />
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}

function SortableTableHead<TData extends RowData>({
  children,
  column
}: {
  children: ReactNode
  column: Column<typeof organizationTableFeatures, TData> | undefined
}) {
  const sortDirection = column?.getIsSorted() || undefined

  return (
    <TableHead
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : "none"
      }
    >
      <Button
        className="h-auto w-full justify-start p-0 font-medium hover:bg-transparent"
        onClick={column?.getToggleSortingHandler()}
        size="sm"
        type="button"
        variant="ghost"
      >
        {children}

        {!!sortDirection && (
          <ChevronUp
            className={cn(
              "size-3 transition-transform duration-100 ease-out",
              sortDirection === "desc" ? "rotate-180" : ""
            )}
          />
        )}
      </Button>
    </TableHead>
  )
}
