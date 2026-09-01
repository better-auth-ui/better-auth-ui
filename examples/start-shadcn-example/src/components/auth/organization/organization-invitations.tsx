"use client"

import {
  hasMemberRole,
  type OrganizationAuthClient,
  type OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useCancelInvitation,
  useHasPermission,
  useListOrganizationInvitations
} from "@better-auth-ui/react/plugins/organization"
import type { Invitation } from "better-auth/client"
import { Filter, Search, X } from "lucide-react"
import { type ComponentProps, useState } from "react"
import { toast } from "sonner"

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
import { OrganizationTableBulkAction } from "./organization-table-bulk-action"
import { OrganizationTablePagination } from "./organization-table-pagination"
import { OrganizationTableSelectAll } from "./organization-table-selection"
import { useOrganizationTableState } from "./organization-table-state"
import { OrganizationTableViewOptions } from "./organization-table-view-options"

const invitationColumnHelper = createOrganizationColumnHelper<Invitation>()
const invitationColumns = invitationColumnHelper.columns([
  invitationColumnHelper.accessor("email", {
    enableHiding: false,
    filterFn: "includesString"
  }),
  invitationColumnHelper.accessor(
    (invitation) => new Date(invitation.createdAt).getTime(),
    { id: "createdAt", enableGlobalFilter: false }
  ),
  invitationColumnHelper.accessor("role", {
    enableGlobalFilter: false,
    filterFn: (row, columnId, value) =>
      hasMemberRole(row.getValue<string>(columnId), String(value))
  }),
  invitationColumnHelper.accessor("status", {
    enableGlobalFilter: false,
    filterFn: (row, columnId, value) => row.getValue(columnId) === String(value)
  })
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
  const canCancel = useHasPermission(authClient, {
    permissions: { invitation: ["cancel"] }
  })

  const isPending = invitationsPending || canCancel.isPending
  const tableState = useOrganizationTableState(
    "organizationInvitations",
    ORGANIZATION_TABLE_PAGE_SIZE
  )
  const {
    columnFilters,
    columnVisibility,
    globalFilter,
    pagination,
    rowSelection,
    sorting
  } = tableState

  const table = useOrganizationTable({
    columns: invitationColumns,
    data: invitations ?? EMPTY_INVITATIONS,
    enableRowSelection: (row) =>
      canCancel.data?.success === true && row.original.status === "pending",
    globalFilterFn: "includesString",
    getRowId: (invitation) => invitation.id,
    state: {
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
      rowSelection,
      sorting
    },
    onColumnFiltersChange: tableState.setColumnFilters,
    onColumnVisibilityChange: tableState.setColumnVisibility,
    onGlobalFilterChange: tableState.setGlobalFilter,
    onPaginationChange: tableState.setPagination,
    onRowSelectionChange: tableState.setRowSelection,
    onSortingChange: tableState.setSorting
  })

  const cancelInvitations = useCancelInvitation(authClient)
  const roleFilter = String(table.getColumn("role")?.getFilterValue() ?? "all")
  const statusFilter = String(
    table.getColumn("status")?.getFilterValue() ?? "all"
  )
  const roleFacetRows = table.getColumn("role")?.getFacetedRowModel().flatRows
  const statusCounts = table.getColumn("status")?.getFacetedUniqueValues()
  const selectedInvitations = table.getSelectedRowModel().rows
  const showSelection = canCancel.data?.success === true
  const visibleColumnCount = table.getVisibleLeafColumns().length

  async function cancelSelectedInvitations() {
    const results = await Promise.allSettled(
      selectedInvitations.map((row) =>
        cancelInvitations.mutateAsync({ invitationId: row.original.id })
      )
    )
    const canceledCount = results.filter(
      (result) => result.status === "fulfilled"
    ).length
    const failed = results.find((result) => result.status === "rejected")

    if (canceledCount > 0) {
      toast.success(
        organizationLocalization.invitationsCanceled.replace(
          "{{count}}",
          String(canceledCount)
        )
      )
    }
    if (failed?.status === "rejected") {
      toast.error(
        failed.reason instanceof Error
          ? failed.reason.message
          : String(failed.reason)
      )
    }
    table.resetRowSelection(true)
  }

  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <h3 className="truncate text-sm font-semibold">
        {organizationLocalization.invitations}
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <InputGroup className="min-w-0 sm:w-[220px]">
            <InputGroupInput
              type="search"
              value={globalFilter}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
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
                onValueChange={(value) =>
                  table
                    .getColumn("role")
                    ?.setFilterValue(value === "all" ? undefined : value)
                }
              >
                <DropdownMenuRadioItem value="all">
                  {organizationLocalization.all}
                </DropdownMenuRadioItem>

                {Object.entries(roles).map(([key, label]) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {label} (
                    {roleFacetRows?.filter((row) =>
                      hasMemberRole(row.original.role, key)
                    ).length ?? 0}
                    )
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
                onValueChange={(value) =>
                  table
                    .getColumn("status")
                    ?.setFilterValue(value === "all" ? undefined : value)
                }
              >
                <DropdownMenuRadioItem value="all">
                  {organizationLocalization.all}
                </DropdownMenuRadioItem>

                {(["pending", "accepted", "rejected", "canceled"] as const).map(
                  (status) => (
                    <DropdownMenuRadioItem key={status} value={status}>
                      {organizationLocalization[
                        status as keyof OrganizationLocalization
                      ] ?? status}{" "}
                      ({statusCounts?.get(status) ?? 0})
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ms-auto">
            <OrganizationTableViewOptions
              columns={[
                {
                  id: "createdAt",
                  label: organizationLocalization.invitedAt,
                  visible: table.getColumn("createdAt")?.getIsVisible() ?? true,
                  onVisibleChange: (visible) =>
                    table.getColumn("createdAt")?.toggleVisibility(visible)
                },
                {
                  id: "role",
                  label: organizationLocalization.role,
                  visible: table.getColumn("role")?.getIsVisible() ?? true,
                  onVisibleChange: (visible) =>
                    table.getColumn("role")?.toggleVisibility(visible)
                },
                {
                  id: "status",
                  label: organizationLocalization.status,
                  visible: table.getColumn("status")?.getIsVisible() ?? true,
                  onVisibleChange: (visible) =>
                    table.getColumn("status")?.toggleVisibility(visible)
                }
              ]}
              disabled={isPending}
              localization={organizationLocalization}
            />
          </div>
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
                  onClick={() =>
                    table.getColumn("role")?.setFilterValue(undefined)
                  }
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
                  onClick={() =>
                    table.getColumn("status")?.setFilterValue(undefined)
                  }
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

        {selectedInvitations.length > 0 && (
          <OrganizationTableBulkAction
            actionLabel={organizationLocalization.cancelSelectedInvitations}
            cancelLabel={localization.settings.cancel}
            count={selectedInvitations.length}
            description={
              organizationLocalization.cancelSelectedInvitationsDescription
            }
            isPending={cancelInvitations.isPending}
            onConfirm={cancelSelectedInvitations}
            selectedLabel={organizationLocalization.selectedCount}
          />
        )}

        <Card className="p-0">
          <Table aria-label={organizationLocalization.invitations}>
            <TableHeader>
              <TableRow>
                {showSelection && (
                  <TableHead className="w-10">
                    <OrganizationTableSelectAll
                      allSelected={table.getIsAllPageRowsSelected()}
                      disabled={isPending}
                      localization={organizationLocalization}
                      onCheckedChange={(checked) =>
                        table.toggleAllPageRowsSelected(checked)
                      }
                      someSelected={table.getIsSomePageRowsSelected()}
                    />
                  </TableHead>
                )}

                <OrganizationSortableTableHead
                  column={table.getColumn("email")}
                >
                  {localization.auth.email}
                </OrganizationSortableTableHead>

                {table.getColumn("createdAt")?.getIsVisible() && (
                  <OrganizationSortableTableHead
                    column={table.getColumn("createdAt")}
                  >
                    {organizationLocalization.invitedAt}
                  </OrganizationSortableTableHead>
                )}

                {table.getColumn("role")?.getIsVisible() && (
                  <OrganizationSortableTableHead
                    column={table.getColumn("role")}
                  >
                    {organizationLocalization.role}
                  </OrganizationSortableTableHead>
                )}

                {table.getColumn("status")?.getIsVisible() && (
                  <OrganizationSortableTableHead
                    column={table.getColumn("status")}
                  >
                    {organizationLocalization.status}
                  </OrganizationSortableTableHead>
                )}

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
                  <TableCell
                    colSpan={visibleColumnCount + 1 + Number(showSelection)}
                  >
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
                  .rows.map((row) => (
                    <OrganizationInvitationRow
                      key={row.original.id}
                      invitation={row.original}
                      selectableRow={showSelection ? row : undefined}
                      showCreatedAt={table
                        .getColumn("createdAt")
                        ?.getIsVisible()}
                      showRole={table.getColumn("role")?.getIsVisible()}
                      showStatus={table.getColumn("status")?.getIsVisible()}
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
          onFirstPage={() => table.firstPage()}
          onLastPage={() => table.lastPage()}
          onNextPage={() => table.nextPage()}
          onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
          onPreviousPage={() => table.previousPage()}
          pageCount={table.getPageCount()}
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
