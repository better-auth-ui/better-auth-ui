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
import { Funnel, Xmark } from "@gravity-ui/icons"
import {
  Button,
  Chip,
  cn,
  Dropdown,
  Label,
  SearchField,
  Table,
  toast
} from "@heroui/react"
import type { Invitation } from "better-auth/client"
import { type ComponentProps, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { getHeroUISortDescriptor, getTanStackSorting } from "../table-bridge"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationInvitationTableRow } from "./organization-invitation-row"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"
import { OrganizationInvitationsEmpty } from "./organization-invitations-empty"
import { OrganizationSortableTableHeader } from "./organization-sortable-table-header"
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
const INVITATION_COLUMN_IDS = ["email", "createdAt", "role", "status"] as const
const EMPTY_INVITATIONS: Invitation[] = []

/** Props for the {@link OrganizationInvitations} component. */
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

  const canInvite = useHasPermission(authClient as OrganizationAuthClient, {
    permissions: { invitation: ["create"] }
  })
  const canCancel = useHasPermission(authClient as OrganizationAuthClient, {
    permissions: { invitation: ["cancel"] }
  })

  const isPending = invitationsPending || canCancel.isPending
  const tableState = useOrganizationTableState(
    "organizationInvitations",
    ORGANIZATION_TABLE_PAGE_SIZE,
    INVITATION_COLUMN_IDS
  )
  const { globalFilter, pagination } = tableState

  const table = useOrganizationTable(
    {
      atoms: tableState.atoms,
      columns: invitationColumns,
      data: invitations ?? EMPTY_INVITATIONS,
      enableRowSelection: (row) =>
        canCancel.data?.success === true && row.original.status === "pending",
      globalFilterFn: "includesString",
      getRowId: (invitation) => invitation.id
    },
    () => null
  )

  const cancelInvitations = useCancelInvitation(
    authClient as OrganizationAuthClient
  )
  const roleFilter = String(table.getColumn("role")?.getFilterValue() ?? "all")
  const statusFilter = String(
    table.getColumn("status")?.getFilterValue() ?? "all"
  )
  const roleFacetRows = table.getColumn("role")?.getFacetedRowModel().flatRows
  const statusCounts = table.getColumn("status")?.getFacetedUniqueValues()
  const selectedInvitations = table.getSelectedRowModel().rows
  const showSelection = canCancel.data?.success === true

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
    if (canceledCount > 0)
      toast.success(
        organizationLocalization.invitationsCanceled.replace(
          "{{count}}",
          String(canceledCount)
        )
      )
    if (failed?.status === "rejected")
      toast.danger(
        failed.reason instanceof Error
          ? failed.reason.message
          : String(failed.reason)
      )
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
          <SearchField
            className="min-w-0"
            aria-label={organizationLocalization.search}
            value={globalFilter}
            onChange={table.setGlobalFilter}
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
                  table
                    .getColumn("role")
                    ?.setFilterValue(!key || key === "all" ? undefined : key)
                }}
              >
                <Dropdown.Item
                  id="all"
                  textValue={organizationLocalization.all}
                >
                  <Label>{organizationLocalization.all}</Label>

                  <Dropdown.ItemIndicator />
                </Dropdown.Item>

                {Object.entries(roles).map(([key, label]) => (
                  <Dropdown.Item key={key} id={key} textValue={label}>
                    <Label>
                      {label} (
                      {roleFacetRows?.filter((row) =>
                        hasMemberRole(row.original.role, key)
                      ).length ?? 0}
                      )
                    </Label>

                    <Dropdown.ItemIndicator />
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <Dropdown>
            <Button size="sm" variant="secondary" isDisabled={isPending}>
              <Funnel />

              {organizationLocalization.status}
            </Button>

            <Dropdown.Popover>
              <Dropdown.Menu
                selectionMode="single"
                selectedKeys={new Set([statusFilter])}
                onSelectionChange={(keys) => {
                  const key = [...keys][0] as string | undefined
                  table
                    .getColumn("status")
                    ?.setFilterValue(!key || key === "all" ? undefined : key)
                }}
              >
                <Dropdown.Item
                  id="all"
                  textValue={organizationLocalization.all}
                >
                  <Label>{organizationLocalization.all}</Label>

                  <Dropdown.ItemIndicator />
                </Dropdown.Item>

                {["pending", "accepted", "rejected", "canceled"].map(
                  (status) => (
                    <Dropdown.Item
                      key={status}
                      id={status}
                      textValue={
                        organizationLocalization[
                          status as keyof OrganizationLocalization
                        ] ?? status
                      }
                    >
                      <Label>
                        {organizationLocalization[
                          status as keyof OrganizationLocalization
                        ] ?? status}{" "}
                        ({statusCounts?.get(status) ?? 0})
                      </Label>

                      <Dropdown.ItemIndicator />
                    </Dropdown.Item>
                  )
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

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
                  onClick={() =>
                    table.getColumn("role")?.setFilterValue(undefined)
                  }
                >
                  <Xmark className="size-3" />
                </button>
              </Chip>
            )}

            {statusFilter !== "all" && (
              <Chip size="sm" variant="secondary" className="w-fit">
                <Chip.Label>
                  {organizationLocalization.status}:{" "}
                  {organizationLocalization[
                    statusFilter as keyof OrganizationLocalization
                  ] ?? statusFilter}
                </Chip.Label>

                <button
                  type="button"
                  aria-label={organizationLocalization.clear}
                  className="text-muted hover:text-foreground inline-flex cursor-pointer items-center"
                  onClick={() =>
                    table.getColumn("status")?.setFilterValue(undefined)
                  }
                >
                  <Xmark className="size-3" />
                </button>
              </Chip>
            )}
          </div>
        )}

        <OrganizationTableBulkAction
          cancelLabel={localization.settings.cancel}
          confirmLabel={organizationLocalization.cancelSelectedInvitations}
          description={
            organizationLocalization.cancelSelectedInvitationsDescription
          }
          onConfirm={cancelSelectedInvitations}
          pending={cancelInvitations.isPending}
          selectedCount={selectedInvitations.length}
          title={organizationLocalization.cancelSelectedInvitations}
          localization={organizationLocalization}
        />

        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label={organizationLocalization.invitations}
              onSortChange={(descriptor) =>
                table.setSorting(
                  getTanStackSorting(descriptor, tableState.sorting)
                )
              }
              sortDescriptor={getHeroUISortDescriptor(tableState.sorting)}
            >
              <Table.Header>
                {showSelection && (
                  <Table.Column>
                    <OrganizationTableSelectAll
                      allSelected={table.getIsAllPageRowsSelected()}
                      disabled={isPending}
                      localization={organizationLocalization}
                      onCheckedChange={(checked) =>
                        table.toggleAllPageRowsSelected(checked)
                      }
                      someSelected={table.getIsSomePageRowsSelected()}
                    />
                  </Table.Column>
                )}
                <Table.Column allowsSorting id="email" isRowHeader>
                  {({ sortDirection }) => (
                    <OrganizationSortableTableHeader
                      column={table.getColumn("email")}
                      interactive={false}
                      nativeSortDirection={sortDirection}
                    >
                      {localization.auth.email}
                    </OrganizationSortableTableHeader>
                  )}
                </Table.Column>

                {table.getColumn("createdAt")?.getIsVisible() && (
                  <Table.Column allowsSorting id="createdAt">
                    {({ sortDirection }) => (
                      <OrganizationSortableTableHeader
                        column={table.getColumn("createdAt")}
                        interactive={false}
                        nativeSortDirection={sortDirection}
                      >
                        {organizationLocalization.invitedAt}
                      </OrganizationSortableTableHeader>
                    )}
                  </Table.Column>
                )}

                {table.getColumn("role")?.getIsVisible() && (
                  <Table.Column allowsSorting id="role">
                    {({ sortDirection }) => (
                      <OrganizationSortableTableHeader
                        column={table.getColumn("role")}
                        interactive={false}
                        nativeSortDirection={sortDirection}
                      >
                        {organizationLocalization.role}
                      </OrganizationSortableTableHeader>
                    )}
                  </Table.Column>
                )}

                {table.getColumn("status")?.getIsVisible() && (
                  <Table.Column allowsSorting id="status">
                    {({ sortDirection }) => (
                      <OrganizationSortableTableHeader
                        column={table.getColumn("status")}
                        interactive={false}
                        nativeSortDirection={sortDirection}
                      >
                        {organizationLocalization.status}
                      </OrganizationSortableTableHeader>
                    )}
                  </Table.Column>
                )}

                <Table.Column className="text-end">
                  {organizationLocalization.actions}
                </Table.Column>
              </Table.Header>

              <Table.Body
                renderEmptyState={() => (
                  <OrganizationInvitationsEmpty
                    isInvitePending={canInvite.isPending}
                    onInvitePress={
                      canInvite.data?.success
                        ? () => setInviteOpen(true)
                        : undefined
                    }
                  />
                )}
              >
                {isPending ? (
                  <OrganizationInvitationRowSkeleton />
                ) : (
                  table
                    .getRowModel()
                    .rows.map((row) => (
                      <OrganizationInvitationTableRow
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
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>

        <OrganizationTablePagination
          canNextPage={table.getCanNextPage()}
          canPreviousPage={table.getCanPreviousPage()}
          disabled={isPending}
          localization={organizationLocalization}
          onFirstPage={() => table.firstPage()}
          onLastPage={() => table.lastPage()}
          onNextPage={() => table.nextPage()}
          onPageSizeChange={(size) => table.setPageSize(size)}
          onPreviousPage={() => table.previousPage()}
          pageCount={table.getPageCount()}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          rowCount={table.getRowCount()}
          visibleRowCount={table.getRowModel().rows.length}
        />
      </div>

      {canInvite.data?.success && (
        <InviteMemberDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />
      )}
    </div>
  )
}
