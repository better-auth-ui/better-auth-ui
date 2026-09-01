import {
  hasMemberRole,
  mergeOrganizationRoleLabels,
  type OrganizationAuthClient,
  type OrganizationLocalization,
  type OrganizationRolesAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import {
  useActiveMemberRole,
  useActiveOrganization,
  useHasPermission,
  useListOrganizationMembers,
  useListRoles,
  useRemoveMember
} from "@better-auth-ui/solid/plugins/organization"
import { Filter, Search, X } from "lucide-solid"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
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
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"
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

export type OrganizationMembersProps = {
  class?: string
  /** Organization to query. The current organization is used when omitted. */
  organizationId?: string
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

type OrganizationMember = {
  id: string
  organizationId: string
  role?: string | null
  userId?: string | null
  user?: {
    email?: string | null
    image?: string | null
    name?: string | null
  } | null
}

const memberColumnHelper = createOrganizationColumnHelper<OrganizationMember>()
const memberColumns = memberColumnHelper.columns([
  memberColumnHelper.accessor(
    (member) => member.user?.name ?? member.user?.email ?? "",
    { id: "name", enableHiding: false, filterFn: "includesString" }
  ),
  memberColumnHelper.accessor((member) => member.role ?? "", {
    id: "role",
    enableGlobalFilter: false,
    filterFn: (row, columnId, value) =>
      hasMemberRole(row.getValue<string>(columnId), String(value))
  }),
  memberColumnHelper.display({
    id: "teams",
    enableGlobalFilter: false,
    enableSorting: false
  })
])

type RoleMap = Record<string, string>

const fallbackLocalization = {
  changeMemberRole: "Change member role",
  changeMemberRoleDescription:
    "Choose the roles this member should have in the organization.",
  memberRoleUpdated: "Member role updated",
  removeMember: "Remove member",
  removeMemberWarning:
    "Are you sure you want to remove this member from the organization? They will lose access immediately.",
  memberRemoved: "Member removed",
  leaveOrganization: "Leave organization",
  leaveOrganizationDescription:
    "Leave this organization and lose access to its data and resources. You'll need a new invitation to rejoin.",
  leftOrganization: "You left the organization",
  onlyOwnerActionDisabled: "Transfer ownership before removing the only owner.",
  teams: "Teams",
  noTeams: "No teams",
  search: "Search...",
  clear: "Clear",
  all: "All",
  role: "Role",
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
  removeSelectedMembers: "Remove selected members",
  removeSelectedMembersDescription: "Remove every selected member?",
  membersRemoved: "Removed {{count}} members"
} satisfies Pick<
  OrganizationLocalization,
  | "changeMemberRole"
  | "changeMemberRoleDescription"
  | "memberRoleUpdated"
  | "removeMember"
  | "removeMemberWarning"
  | "memberRemoved"
  | "leaveOrganization"
  | "leaveOrganizationDescription"
  | "leftOrganization"
  | "onlyOwnerActionDisabled"
  | "teams"
  | "noTeams"
  | "search"
  | "clear"
  | "all"
  | "role"
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
  | "removeSelectedMembers"
  | "removeSelectedMembersDescription"
  | "membersRemoved"
>

const fallbackRoles: RoleMap = {
  owner: fallbackLocalization.owner,
  admin: fallbackLocalization.admin,
  member: fallbackLocalization.member
}

export function OrganizationMembers(props: OrganizationMembersProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const [inviteOpen, setInviteOpen] = createSignal(false)
  const tableState = createOrganizationTableState(
    "organizationMembers",
    validatePageSize(props.pageSize) ?? ORGANIZATION_TABLE_PAGE_SIZE
  )
  const pageSize = () => validatePageSize(props.pageSize)
  const paged = () => pageSize() !== undefined
  const activeOrganization = useActiveOrganization(auth.authClient)
  let previousOrganizationId: string | undefined

  createEffect(() => {
    const organizationId = props.organizationId ?? activeOrganization.data?.id
    if (!organizationId) return
    if (previousOrganizationId && previousOrganizationId !== organizationId) {
      tableState.setPagination((current) => ({ ...current, pageIndex: 0 }))
    }
    previousOrganizationId = organizationId
  })

  const members = useListOrganizationMembers(auth.authClient, () => {
    const size = pageSize()

    if (size === undefined) return {}

    const descriptor = tableState.sorting()[0]
    const roleFilter = String(
      tableState.columnFilters().find((filter) => filter.id === "role")
        ?.value ?? "all"
    )

    return {
      query: {
        limit: tableState.pagination().pageSize,
        offset:
          tableState.pagination().pageIndex * tableState.pagination().pageSize,
        organizationId: props.organizationId,
        ...(roleFilter === "all"
          ? {}
          : {
              filterField: "role",
              filterValue: roleFilter,
              // Roles are stored comma-joined, so an exact match would drop
              // anyone holding more than one.
              filterOperator: "contains" as const
            }),
        ...(descriptor?.id === "role"
          ? {
              sortBy: "role",
              sortDirection: descriptor.desc
                ? ("desc" as const)
                : ("asc" as const)
            }
          : {})
      }
    }
  })

  // The signed-in user need not be on the loaded page, so their own role comes
  // from a dedicated endpoint rather than from the member list.
  const activeMemberRole = useActiveMemberRole(auth.authClient)
  const session = useSession(auth.authClient)
  const owners = useListOrganizationMembers(auth.authClient, () => ({
    query: {
      organizationId: props.organizationId,
      filterField: "role",
      filterValue: config.creatorRole,
      filterOperator: "contains",
      limit: 1
    }
  }))
  const canInvite = useHasPermission(auth.authClient, () => ({
    permissions: { invitation: ["create"] }
  }))
  const canListMemberTeams = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { member: ["update"] },
    enabled: config.teams
  }))
  const canDeleteMembers = useHasPermission(auth.authClient, () => ({
    organizationId: props.organizationId,
    permissions: { member: ["delete"] }
  }))
  const canReadRoles = useHasPermission(auth.authClient, () => ({
    permissions: { ac: ["read"] }
  }))
  const dynamicRoles = useListRoles(
    auth.authClient as OrganizationRolesAuthClient,
    () => ({
      query: { organizationId: props.organizationId },
      enabled:
        config.dynamicAccessControl?.enabled === true &&
        canReadRoles.data?.success === true
    })
  )
  const memberRows = () => (members.data?.members ?? []) as OrganizationMember[]
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | {
          localization?: Pick<
            OrganizationLocalization,
            | "changeMemberRole"
            | "changeMemberRoleDescription"
            | "memberRoleUpdated"
            | "removeMember"
            | "removeMemberWarning"
            | "memberRemoved"
            | "leaveOrganization"
            | "leaveOrganizationDescription"
            | "leftOrganization"
            | "onlyOwnerActionDisabled"
            | "teams"
            | "noTeams"
            | "search"
            | "clear"
            | "all"
            | "role"
            | "member"
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
            | "removeSelectedMembers"
            | "removeSelectedMembersDescription"
            | "membersRemoved"
          >
          roles?: RoleMap
        }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? fallbackLocalization
  const roles = createMemo(() =>
    mergeOrganizationRoleLabels(
      organizationPluginConfig()?.roles ?? fallbackRoles,
      dynamicRoles.data
    )
  )
  const memberRoleFilter = () =>
    String(table.getColumn("role")?.getFilterValue() ?? "all")
  const selectedRoleLabel = () =>
    roles()[memberRoleFilter()] ?? memberRoleFilter()
  const isOwner = () =>
    hasMemberRole(activeMemberRole.data?.role, config.creatorRole)
  const ownerCount = () => owners.data?.total ?? owners.data?.members.length
  const showTeams = () =>
    config.teams && canListMemberTeams.data?.success === true

  const total = () => members.data?.total ?? memberRows().length
  const table = createOrganizationTable({
    columns: memberColumns,
    get data() {
      return memberRows()
    },
    enableRowSelection: (row) => {
      const targetIsOwner = hasMemberRole(row.original.role, config.creatorRole)
      const count = ownerCount()
      return (
        canDeleteMembers.data?.success === true &&
        row.original.userId !== session.data?.user.id &&
        (isOwner() || !targetIsOwner) &&
        !(targetIsOwner && (count === undefined || count <= 1))
      )
    },
    globalFilterFn: "includesString",
    get manualFiltering() {
      return paged()
    },
    get manualPagination() {
      return paged()
    },
    get manualSorting() {
      return paged()
    },
    get rowCount() {
      return paged() ? total() : undefined
    },
    get state() {
      return {
        columnFilters: tableState.columnFilters(),
        columnVisibility: {
          ...tableState.columnVisibility(),
          teams: showTeams() && tableState.columnVisibility().teams !== false
        },
        globalFilter: tableState.globalFilter(),
        pagination: tableState.pagination(),
        rowSelection: tableState.rowSelection(),
        sorting: tableState.sorting()
      }
    },
    getRowId: (member) => member.id,
    onColumnFiltersChange: tableState.setColumnFilters,
    onColumnVisibilityChange: tableState.setColumnVisibility,
    onGlobalFilterChange: tableState.setGlobalFilter,
    onPaginationChange: tableState.setPagination,
    onRowSelectionChange: tableState.setRowSelection,
    onSortingChange: tableState.setSorting
  })
  const removeMembers = useRemoveMember(auth.authClient)
  const selectedMembers = () => table.getSelectedRowModel().rows
  const roleFacetRows = () =>
    table.getColumn("role")?.getFacetedRowModel().flatRows
  const removeSelectedMembers = async () => {
    const results = await Promise.allSettled(
      selectedMembers().map((row) =>
        removeMembers.mutateAsync({
          memberIdOrEmail: row.original.id,
          organizationId: row.original.organizationId
        })
      )
    )
    const count = results.filter(
      (result) => result.status === "fulfilled"
    ).length
    const failed = results.find((result) => result.status === "rejected")
    if (count)
      toast.success(
        localization().membersRemoved.replace("{{count}}", String(count))
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
      <div class="flex items-end justify-between gap-3">
        <h3 class="truncate text-sm font-semibold">Members</h3>
        <Show when={canInvite.isPending || canInvite.data?.success}>
          <Button
            class="shrink-0"
            disabled={
              canInvite.isPending ||
              (config.membershipLimit !== undefined &&
                total() >= config.membershipLimit)
            }
            onClick={() => setInviteOpen(true)}
            size="sm"
            type="button"
          >
            Invite member
          </Button>
        </Show>
      </div>
      <Show
        when={
          !members.isPending &&
          !owners.isPending &&
          !(config.teams && canListMemberTeams.isPending)
        }
        fallback={
          <Card class="z-card-padding-none">
            <Table>
              <TableBody>
                <OrganizationMemberRowSkeleton showTeams={config.teams} />
                <OrganizationMemberRowSkeleton showTeams={config.teams} />
              </TableBody>
            </Table>
          </Card>
        }
      >
        <Show
          when={memberRows().length > 0}
          fallback={
            <p class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No members found for this organization.
            </p>
          }
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* list-members has no search parameter, so a search box would
                only ever filter the page in front of you. */}
            <Show when={!paged()}>
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
            </Show>
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
                  value={memberRoleFilter()}
                >
                  <DropdownMenuRadioItem value="all">
                    {localization().all}
                  </DropdownMenuRadioItem>
                  <For each={Object.entries(roles())}>
                    {([role, label]) => (
                      <DropdownMenuRadioItem value={role}>
                        {label}
                        {!paged()
                          ? ` (${roleFacetRows()?.filter((row) => hasMemberRole(row.original.role, role)).length ?? 0})`
                          : ""}
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
                    id: "role",
                    label: localization().role,
                    visible: table.getColumn("role")?.getIsVisible() ?? true,
                    onVisibleChange: (visible) =>
                      table.getColumn("role")?.toggleVisibility(visible)
                  },
                  ...(showTeams()
                    ? [
                        {
                          id: "teams",
                          label: localization().teams,
                          visible:
                            table.getColumn("teams")?.getIsVisible() ?? true,
                          onVisibleChange: (visible: boolean) =>
                            table.getColumn("teams")?.toggleVisibility(visible)
                        }
                      ]
                    : [])
                ]}
                localization={localization()}
              />
            </div>
          </div>
          <Show when={memberRoleFilter() !== "all"}>
            <div class="flex flex-wrap gap-2">
              <Show when={memberRoleFilter() !== "all"}>
                <Badge class="gap-1 pr-1" variant="secondary">
                  {localization().role}: {selectedRoleLabel()}
                  <Button
                    aria-label={`${localization().clear} member role filter`}
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
            </div>
          </Show>
          <OrganizationTableBulkAction
            cancelLabel={auth.localization.settings.cancel}
            confirmLabel={localization().removeSelectedMembers}
            description={localization().removeSelectedMembersDescription}
            localization={localization()}
            onConfirm={removeSelectedMembers}
            pending={removeMembers.isPending}
            selectedCount={selectedMembers().length}
            title={localization().removeSelectedMembers}
          />
          <Card class="z-card-padding-none">
            <Table aria-label="Members">
              <TableHeader>
                <TableRow>
                  <Show when={canDeleteMembers.data?.success}>
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
                  {/* Name and email live on the joined user row, which
                      list-members cannot sort by. */}
                  <Show
                    when={!paged()}
                    fallback={<TableHead>{localization().member}</TableHead>}
                  >
                    <OrganizationSortableTableHead
                      column={table.getColumn("name")}
                    >
                      {localization().member}
                    </OrganizationSortableTableHead>
                  </Show>
                  <Show when={table.getColumn("role")?.getIsVisible()}>
                    <OrganizationSortableTableHead
                      column={table.getColumn("role")}
                    >
                      {localization().role}
                    </OrganizationSortableTableHead>
                  </Show>
                  <Show
                    when={
                      showTeams() && table.getColumn("teams")?.getIsVisible()
                    }
                  >
                    <TableHead>{localization().teams}</TableHead>
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
                        colSpan={showTeams() ? 4 : 3}
                      >
                        No members match the current filters.
                      </TableCell>
                    </TableRow>
                  }
                >
                  <For each={table.getRowModel().rows}>
                    {(row) => (
                      <OrganizationMemberRow
                        isOwner={isOwner()}
                        localization={localization()}
                        member={row.original}
                        ownerCount={ownerCount()}
                        roles={roles()}
                        selectableRow={
                          canDeleteMembers.data?.success ? row : undefined
                        }
                        showRole={table.getColumn("role")?.getIsVisible()}
                        showTeams={
                          showTeams() &&
                          table.getColumn("teams")?.getIsVisible() === true
                        }
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
            disabled={members.isPending}
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
      <Show when={canInvite.data?.success}>
        <InviteMemberDialog open={inviteOpen()} onOpenChange={setInviteOpen} />
      </Show>
    </div>
  )
}
