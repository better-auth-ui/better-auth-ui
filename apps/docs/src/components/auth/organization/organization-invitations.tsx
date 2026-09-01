"use client"

import {
  hasMemberRole,
  type OrganizationAuthClient,
  type OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useHasPermission,
  useListOrganizationInvitations
} from "@better-auth-ui/react/plugins/organization"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import type { Invitation } from "better-auth/client"
import { Filter, Search, X } from "lucide-react"
import { type ComponentProps, useMemo, useState } from "react"

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
import { cn } from "@/lib/utils"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationInvitationRow } from "./organization-invitation-row"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"
import { OrganizationInvitationsEmpty } from "./organization-invitations-empty"
import { OrganizationSortableTableHead } from "./organization-sortable-table-head"
import {
  createOrganizationColumnHelper,
  ORGANIZATION_TABLE_PAGE_SIZE,
  useOrganizationTable
} from "./organization-table"
import { OrganizationTablePagination } from "./organization-table-pagination"

const invitationColumnHelper = createOrganizationColumnHelper<Invitation>()
const invitationColumns = invitationColumnHelper.columns([
  invitationColumnHelper.accessor("email", {}),
  invitationColumnHelper.accessor(
    (invitation) => new Date(invitation.createdAt).getTime(),
    { id: "createdAt" }
  ),
  invitationColumnHelper.accessor("role", {}),
  invitationColumnHelper.accessor("status", {})
])
const EMPTY_INVITATIONS: Invitation[] = []

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
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)
  const { data: invitations, isPending: invitationsPending } =
    useListOrganizationInvitations(authClient)

  const canInvite = useHasPermission(authClient, {
    permissions: { invitation: ["create"] }
  })

  const isPending = invitationsPending

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: ORGANIZATION_TABLE_PAGE_SIZE
  })
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filteredInvitations = useMemo(() => {
    return invitations?.filter(
      (invitation) =>
        (roleFilter === "all" || hasMemberRole(invitation.role, roleFilter)) &&
        (statusFilter === "all" || invitation.status === statusFilter) &&
        invitation.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, invitations, roleFilter, statusFilter])

  const table = useOrganizationTable({
    columns: invitationColumns,
    data: filteredInvitations ?? EMPTY_INVITATIONS,
    getRowId: (invitation) => invitation.id,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting
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
                <OrganizationSortableTableHead
                  column={table.getColumn("email")}
                >
                  {localization.auth.email}
                </OrganizationSortableTableHead>

                <OrganizationSortableTableHead
                  column={table.getColumn("createdAt")}
                >
                  {organizationLocalization.invitedAt}
                </OrganizationSortableTableHead>

                <OrganizationSortableTableHead column={table.getColumn("role")}>
                  {organizationLocalization.role}
                </OrganizationSortableTableHead>

                <OrganizationSortableTableHead
                  column={table.getColumn("status")}
                >
                  {organizationLocalization.status}
                </OrganizationSortableTableHead>

                <TableHead className="text-end">
                  {organizationLocalization.actions}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                <OrganizationInvitationRowSkeleton />
              ) : !table.getRowModel().rows.length ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <OrganizationInvitationsEmpty
                      isInvitePending={canInvite.isPending}
                      onInvitePress={
                        canInvite.data?.success
                          ? () => setInviteOpen(true)
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table
                  .getRowModel()
                  .rows.map(({ original: invitation }) => (
                    <OrganizationInvitationRow
                      key={invitation.id}
                      invitation={invitation}
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
