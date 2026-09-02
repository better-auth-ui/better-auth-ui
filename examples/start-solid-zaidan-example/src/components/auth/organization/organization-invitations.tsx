import {
  hasMemberRole,
  type OrganizationAuthClient,
  type OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import {
  useCancelInvitation,
  useHasPermission,
  useListOrganizationInvitations
} from "@better-auth-ui/solid/plugins/organization"
import { Filter, Search, X } from "lucide-solid"
import { createMemo, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { OrganizationInvitationRow } from "./organization-invitation-row"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"
import { OrganizationInvitationsEmpty } from "./organization-invitations-empty"
import { OrganizationSortableTableHead } from "./organization-sortable-table-head"
import {
  createOrganizationColumnHelper,
  createOrganizationTable,
  ORGANIZATION_TABLE_PAGE_SIZE
} from "./organization-table"
import { OrganizationTableBulkAction } from "./organization-table-bulk-action"
import { OrganizationTablePagination } from "./organization-table-pagination"
import { OrganizationTableSelectAll } from "./organization-table-selection"
import { createOrganizationTableState } from "./organization-table-state"
import { OrganizationTableViewOptions } from "./organization-table-view-options"

export type OrganizationInvitationsProps = {
  class?: string
}

type RoleMap = Record<string, string>

const fallbackLocalization = {
  search: "Search...",
  clear: "Clear",
  all: "All",
  role: "Role",
  status: "Status",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  canceled: "Canceled",
  member: "Member",
  admin: "Admin",
  owner: "Owner",
  previousPage: "Previous page",
  nextPage: "Next page",
  paginationRange: "{{from}}–{{to}} of {{total}}",
  firstPage: "First page",
  lastPage: "Last page",
  pageOf: "Page {{page}} of {{pages}}",
  rowsPerPage: "Rows per page",
  columns: "Columns",
  selectedCount: "{{count}} selected",
  selectRow: "Select row",
  selectAllRows: "Select all rows",
  cancelSelectedInvitations: "Cancel selected invitations",
  cancelSelectedInvitationsDescription:
    "Cancel every selected pending invitation?",
  invitationsCanceled: "Canceled {{count}} invitations"
} satisfies Pick<
  OrganizationLocalization,
  | "search"
  | "clear"
  | "all"
  | "role"
  | "status"
  | "pending"
  | "accepted"
  | "rejected"
  | "canceled"
  | "member"
  | "admin"
  | "owner"
  | "previousPage"
  | "nextPage"
  | "paginationRange"
  | "firstPage"
  | "lastPage"
  | "pageOf"
  | "rowsPerPage"
  | "columns"
  | "selectedCount"
  | "selectRow"
  | "selectAllRows"
  | "cancelSelectedInvitations"
  | "cancelSelectedInvitationsDescription"
  | "invitationsCanceled"
>

const invitationStatuses = [
  "pending",
  "accepted",
  "rejected",
  "canceled"
] as const

const fallbackRoles: RoleMap = {
  owner: fallbackLocalization.owner,
  admin: fallbackLocalization.admin,
  member: fallbackLocalization.member
}

type OrganizationInvitation = {
  createdAt?: Date | string | null
  email?: string | null
  id: string
  organizationId: string
  role?: string | null
  status?: string | null
}

const invitationColumnHelper =
  createOrganizationColumnHelper<OrganizationInvitation>()
const invitationColumns = invitationColumnHelper.columns([
  invitationColumnHelper.accessor((invitation) => invitation.email ?? "", {
    id: "email",
    enableHiding: false,
    filterFn: "includesString"
  }),
  invitationColumnHelper.accessor(
    (invitation) =>
      invitation.createdAt
        ? new Date(invitation.createdAt).getTime()
        : Number.POSITIVE_INFINITY,
    { id: "createdAt", enableGlobalFilter: false }
  ),
  invitationColumnHelper.accessor((invitation) => invitation.role ?? "", {
    id: "role",
    enableGlobalFilter: false,
    filterFn: (row, columnId, value) =>
      hasMemberRole(row.getValue<string>(columnId), String(value))
  }),
  invitationColumnHelper.accessor((invitation) => invitation.status ?? "", {
    id: "status",
    enableGlobalFilter: false,
    filterFn: (row, columnId, value) => row.getValue(columnId) === String(value)
  })
])
const INVITATION_COLUMN_IDS = ["email", "createdAt", "role", "status"] as const

function formatStatus(status?: string | null) {
  if (!status) return "Pending"

  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function OrganizationInvitations(props: OrganizationInvitationsProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const tableState = createOrganizationTableState(
    "organizationInvitations",
    ORGANIZATION_TABLE_PAGE_SIZE,
    INVITATION_COLUMN_IDS
  )
  const invitations = useListOrganizationInvitations(auth.authClient)
  const invitationRows = () =>
    (invitations.data ?? []) as OrganizationInvitation[]
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | {
          localization?: Pick<
            OrganizationLocalization,
            | "search"
            | "clear"
            | "all"
            | "role"
            | "status"
            | "pending"
            | "accepted"
            | "rejected"
            | "canceled"
            | "previousPage"
            | "nextPage"
            | "paginationRange"
            | "firstPage"
            | "lastPage"
            | "pageOf"
            | "rowsPerPage"
            | "columns"
            | "selectedCount"
            | "selectRow"
            | "selectAllRows"
            | "cancelSelectedInvitations"
            | "cancelSelectedInvitationsDescription"
            | "invitationsCanceled"
          >
          roles?: RoleMap
        }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? fallbackLocalization
  const roles = createMemo(
    () => organizationPluginConfig()?.roles ?? fallbackRoles
  )
  const invitationRoleFilter = () =>
    String(table.getColumn("role")?.getFilterValue() ?? "all")
  const invitationStatusFilter = () =>
    String(table.getColumn("status")?.getFilterValue() ?? "all")
  const selectedRoleLabel = () =>
    roles()[invitationRoleFilter()] ?? invitationRoleFilter()
  const selectedStatusLabel = () =>
    invitationStatusFilter() === "all"
      ? localization().all
      : invitationStatusLabel(
          invitationStatusFilter() as (typeof invitationStatuses)[number]
        )
  const invitationStatusLabel = (status: (typeof invitationStatuses)[number]) =>
    localization()[status] ?? formatStatus(status)
  const table = createOrganizationTable({
    atoms: tableState.atoms,
    columns: invitationColumns,
    get data() {
      return invitationRows()
    },
    enableRowSelection: (row) =>
      canCancel.data?.success === true && row.original.status === "pending",
    globalFilterFn: "includesString",
    get state() {
      return {
        columnVisibility: tableState.columnVisibility()
      }
    },
    getRowId: (invitation) => invitation.id,
    onColumnVisibilityChange: tableState.setColumnVisibility
  })
  const canCancel = useHasPermission(auth.authClient, () => ({
    permissions: { invitation: ["cancel"] }
  }))
  const cancelInvitations = useCancelInvitation(auth.authClient)
  const selectedInvitations = () => table.getSelectedRowModel().rows
  const statusCounts = () => table.getColumn("status")?.getFacetedUniqueValues()
  const roleFacetRows = () =>
    table.getColumn("role")?.getFacetedRowModel().flatRows
  const cancelSelectedInvitations = async () => {
    const results = await Promise.allSettled(
      selectedInvitations().map((row) =>
        cancelInvitations.mutateAsync({ invitationId: row.original.id })
      )
    )
    const count = results.filter(
      (result) => result.status === "fulfilled"
    ).length
    const failed = results.find((result) => result.status === "rejected")
    if (count)
      toast.success(
        localization().invitationsCanceled.replace("{{count}}", String(count))
      )
    if (failed?.status === "rejected")
      toast.error(
        failed.reason instanceof Error
          ? failed.reason.message
          : String(failed.reason)
      )
    table.resetRowSelection(true)
  }

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <h3 class="truncate text-sm font-semibold">Invitations</h3>
      <Show
        when={!invitations.isPending}
        fallback={
          <Card class="z-card-padding-none">
            <Table>
              <TableBody>
                <OrganizationInvitationRowSkeleton />
                <OrganizationInvitationRowSkeleton />
              </TableBody>
            </Table>
          </Card>
        }
      >
        <Show
          when={invitationRows().length > 0}
          fallback={
            <Card class="z-card-padding-none">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5}>
                      <OrganizationInvitationsEmpty />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          }
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <InputGroup class="min-w-0 sm:w-[220px]">
              <InputGroupAddon>
                <Search class="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label={localization().search}
                onInput={(event) =>
                  table.setGlobalFilter(event.currentTarget.value)
                }
                placeholder={localization().search}
                type="search"
                value={tableState.globalFilter()}
              />
            </InputGroup>
            <DropdownMenu>
              <DropdownMenuTrigger
                as={Button}
                class="shrink-0"
                variant="outline"
              >
                <Filter class="size-4" />
                {localization().role}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  onChange={(value) =>
                    table
                      .getColumn("role")
                      ?.setFilterValue(value === "all" ? undefined : value)
                  }
                  value={invitationRoleFilter()}
                >
                  <DropdownMenuRadioItem value="all">
                    {localization().all}
                  </DropdownMenuRadioItem>
                  <For each={Object.entries(roles())}>
                    {([role, label]) => (
                      <DropdownMenuRadioItem value={role}>
                        {label} (
                        {roleFacetRows()?.filter((row) =>
                          hasMemberRole(row.original.role, role)
                        ).length ?? 0}
                        )
                      </DropdownMenuRadioItem>
                    )}
                  </For>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                as={Button}
                class="shrink-0"
                variant="outline"
              >
                <Filter class="size-4" />
                {localization().status}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  onChange={(value) =>
                    table
                      .getColumn("status")
                      ?.setFilterValue(value === "all" ? undefined : value)
                  }
                  value={invitationStatusFilter()}
                >
                  <DropdownMenuRadioItem value="all">
                    {localization().all}
                  </DropdownMenuRadioItem>
                  <For each={invitationStatuses}>
                    {(status) => (
                      <DropdownMenuRadioItem value={status}>
                        {invitationStatusLabel(status)} (
                        {statusCounts()?.get(status) ?? 0})
                      </DropdownMenuRadioItem>
                    )}
                  </For>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div class="ms-auto">
              <OrganizationTableViewOptions
                columns={[
                  {
                    id: "createdAt",
                    label: "Invited",
                    visible:
                      table.getColumn("createdAt")?.getIsVisible() ?? true,
                    onVisibleChange: (visible) =>
                      table.getColumn("createdAt")?.toggleVisibility(visible)
                  },
                  {
                    id: "role",
                    label: localization().role,
                    visible: table.getColumn("role")?.getIsVisible() ?? true,
                    onVisibleChange: (visible) =>
                      table.getColumn("role")?.toggleVisibility(visible)
                  },
                  {
                    id: "status",
                    label: localization().status,
                    visible: table.getColumn("status")?.getIsVisible() ?? true,
                    onVisibleChange: (visible) =>
                      table.getColumn("status")?.toggleVisibility(visible)
                  }
                ]}
                localization={localization()}
              />
            </div>
          </div>
          <Show
            when={
              invitationRoleFilter() !== "all" ||
              invitationStatusFilter() !== "all"
            }
          >
            <div class="flex flex-wrap gap-2">
              <Show when={invitationRoleFilter() !== "all"}>
                <Badge class="gap-1 pr-1" variant="secondary">
                  {localization().role}: {selectedRoleLabel()}
                  <Button
                    aria-label={`${localization().clear} invitation role filter`}
                    class="size-4 rounded-sm"
                    onClick={() =>
                      table.getColumn("role")?.setFilterValue(undefined)
                    }
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <X class="size-3" />
                  </Button>
                </Badge>
              </Show>
              <Show when={invitationStatusFilter() !== "all"}>
                <Badge class="gap-1 pr-1" variant="secondary">
                  {localization().status}: {selectedStatusLabel()}
                  <Button
                    aria-label={`${localization().clear} invitation status filter`}
                    class="size-4 rounded-sm"
                    onClick={() =>
                      table.getColumn("status")?.setFilterValue(undefined)
                    }
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <X class="size-3" />
                  </Button>
                </Badge>
              </Show>
            </div>
          </Show>
          <OrganizationTableBulkAction
            cancelLabel={auth.localization.settings.cancel}
            confirmLabel={localization().cancelSelectedInvitations}
            description={localization().cancelSelectedInvitationsDescription}
            localization={localization()}
            onConfirm={cancelSelectedInvitations}
            pending={cancelInvitations.isPending}
            selectedCount={selectedInvitations().length}
            title={localization().cancelSelectedInvitations}
          />
          <Card class="z-card-padding-none">
            <Table aria-label="Invitations">
              <TableHeader>
                <TableRow>
                  <Show when={canCancel.data?.success}>
                    <TableHead>
                      <OrganizationTableSelectAll
                        allSelected={table.getIsAllPageRowsSelected()}
                        localization={localization()}
                        onCheckedChange={(checked) =>
                          table.toggleAllPageRowsSelected(checked)
                        }
                        someSelected={table.getIsSomePageRowsSelected()}
                      />
                    </TableHead>
                  </Show>
                  <OrganizationSortableTableHead
                    column={table.getColumn("email")}
                  >
                    Email
                  </OrganizationSortableTableHead>
                  <Show when={table.getColumn("createdAt")?.getIsVisible()}>
                    <OrganizationSortableTableHead
                      column={table.getColumn("createdAt")}
                    >
                      Invited
                    </OrganizationSortableTableHead>
                  </Show>
                  <Show when={table.getColumn("role")?.getIsVisible()}>
                    <OrganizationSortableTableHead
                      column={table.getColumn("role")}
                    >
                      {localization().role}
                    </OrganizationSortableTableHead>
                  </Show>
                  <Show when={table.getColumn("status")?.getIsVisible()}>
                    <OrganizationSortableTableHead
                      column={table.getColumn("status")}
                    >
                      {localization().status}
                    </OrganizationSortableTableHead>
                  </Show>
                  <TableHead class="z-table-head-align-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Show
                  when={table.getRowModel().rows.length > 0}
                  fallback={
                    <TableRow>
                      <TableCell
                        class="text-muted-foreground text-sm"
                        colSpan={5}
                      >
                        No invitations match the current filters.
                      </TableCell>
                    </TableRow>
                  }
                >
                  <For each={table.getRowModel().rows}>
                    {(row) => (
                      <OrganizationInvitationRow
                        invitation={row.original}
                        roles={roles()}
                        selectableRow={
                          canCancel.data?.success ? row : undefined
                        }
                        showCreatedAt={table
                          .getColumn("createdAt")
                          ?.getIsVisible()}
                        showRole={table.getColumn("role")?.getIsVisible()}
                        showStatus={table.getColumn("status")?.getIsVisible()}
                      />
                    )}
                  </For>
                </Show>
              </TableBody>
            </Table>
          </Card>
          <OrganizationTablePagination
            canNextPage={table.getCanNextPage()}
            canPreviousPage={table.getCanPreviousPage()}
            disabled={invitations.isPending}
            localization={localization()}
            onFirstPage={() => table.firstPage()}
            onLastPage={() => table.lastPage()}
            onNextPage={() => table.nextPage()}
            onPageSizeChange={(size) => table.setPageSize(size)}
            onPreviousPage={() => table.previousPage()}
            pageCount={table.getPageCount()}
            pageIndex={tableState.pagination().pageIndex}
            pageSize={tableState.pagination().pageSize}
            rowCount={table.getRowCount()}
            visibleRowCount={table.getRowModel().rows.length}
          />
        </Show>
      </Show>
    </div>
  )
}
