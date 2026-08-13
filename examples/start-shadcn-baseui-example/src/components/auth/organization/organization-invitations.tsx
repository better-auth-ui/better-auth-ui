"use client"

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins"
import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useListOrganizationInvitations
} from "@better-auth-ui/react"
import type { Column, RowData } from "@tanstack/react-table"
import { useTable } from "@tanstack/react-table"
import type { Invitation } from "better-auth/client"
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
  TableCell,
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
import { OrganizationInvitationRow } from "./organization-invitation-row"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"
import { OrganizationInvitationsEmpty } from "./organization-invitations-empty"
import { OrganizationTablePagination } from "./organization-table-pagination"

const EMPTY_INVITATIONS: Invitation[] = []

const columnHelper = createOrganizationColumnHelper<Invitation>()

const invitationColumns = columnHelper.columns([
  columnHelper.accessor("email", { sortFn: "alphanumeric" }),
  columnHelper.accessor((invitation) => new Date(invitation.createdAt), {
    id: "createdAt",
    sortFn: "datetime"
  }),
  columnHelper.accessor("role", { sortFn: "alphanumeric" }),
  columnHelper.accessor("status", { sortFn: "alphanumeric" })
])

/** Props for the `OrganizationInvitations` component. */
export type OrganizationInvitationsProps = {
  className?: string
}

/**
 * Organization invitations table with invite control and per-row actions.
 */
export function OrganizationInvitations({
  className,
  ...props
}: OrganizationInvitationsProps & ComponentProps<"div">) {
  const { authClient, localization } = useAuth()
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
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filteredInvitations = useMemo(() => {
    return invitations?.filter(
      (invitation) =>
        (roleFilter === "all" || invitation.role === roleFilter) &&
        (statusFilter === "all" || invitation.status === statusFilter) &&
        invitation.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, invitations, roleFilter, statusFilter])

  const table = useTable({
    columns: invitationColumns,
    data: filteredInvitations ?? EMPTY_INVITATIONS,
    features: organizationTableFeatures,
    getRowId: (invitation) => invitation.id,
    initialState: {
      pagination: { pageIndex: 0, pageSize: ORGANIZATION_TABLE_PAGE_SIZE }
    }
  })

  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <h3 className="truncate text-sm font-semibold">
        {organizationLocalization.invitations}
      </h3>

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

                {Object.entries(roles).map(([key, label]) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              disabled={isPending}
            >
              <Filter />

              {organizationLocalization.status}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem value="all">
                  {organizationLocalization.all}
                </DropdownMenuRadioItem>

                {(["pending", "accepted", "rejected", "canceled"] as const).map(
                  (status) => (
                    <DropdownMenuRadioItem key={status} value={status}>
                      {organizationLocalization[
                        status as keyof OrganizationLocalization
                      ] ?? status}
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(roleFilter !== "all" || statusFilter !== "all") && (
          <div className="flex flex-wrap gap-2">
            {roleFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
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

            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {organizationLocalization.status}:{" "}
                {organizationLocalization[
                  statusFilter as keyof OrganizationLocalization
                ] ?? statusFilter}
                <Button
                  aria-label={organizationLocalization.clear}
                  className="size-4 rounded-sm text-muted-foreground"
                  onClick={() => setStatusFilter("all")}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        <Card className="p-0">
          <Table aria-label={organizationLocalization.invitations}>
            <TableHeader>
              <TableRow>
                <SortableTableHead column={table.getColumn("email")}>
                  {localization.auth.email}
                </SortableTableHead>

                <SortableTableHead column={table.getColumn("createdAt")}>
                  {organizationLocalization.invitedAt}
                </SortableTableHead>

                <SortableTableHead column={table.getColumn("role")}>
                  {organizationLocalization.role}
                </SortableTableHead>

                <SortableTableHead column={table.getColumn("status")}>
                  {organizationLocalization.status}
                </SortableTableHead>

                <TableHead className="text-end">
                  {organizationLocalization.actions}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                <OrganizationInvitationRowSkeleton />
              ) : !filteredInvitations?.length ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <OrganizationInvitationsEmpty
                      onInvitePress={() => setInviteOpen(true)}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <OrganizationInvitationRow
                      key={row.id}
                      invitation={row.original}
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
