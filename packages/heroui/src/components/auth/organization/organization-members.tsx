import { getClampedTablePageIndex } from "@better-auth-ui/core"
import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveMemberRole,
  useActiveOrganization,
  useHasPermission,
  useListOrganizationMembers,
  useRemoveMember
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
import { keepPreviousData } from "@tanstack/react-query"
import type { Member, User } from "better-auth/client"
import { type ComponentProps, useEffect, useRef, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { getHeroUISortDescriptor, getTanStackSorting } from "../table-bridge"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"
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

type MemberRow = Member & { user: Partial<User> }

const memberColumnHelper = createOrganizationColumnHelper<MemberRow>()
const memberColumns = memberColumnHelper.columns([
  memberColumnHelper.accessor(
    (member) => member.user.name || member.user.email || "",
    { id: "user", enableHiding: false, filterFn: "includesString" }
  ),
  memberColumnHelper.accessor("role", {
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
const memberColumnsWithoutTeams = memberColumns.filter(
  (column) => column.id !== "teams"
)
const EMPTY_MEMBERS: MemberRow[] = []
const MEMBER_COLUMN_IDS = ["user", "role", "teams"] as const

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
  const { authClient, localization } = useAuth()
  const {
    localization: organizationLocalization,
    membershipLimit,
    roles,
    creatorRole,
    teams
  } = useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient as OrganizationAuthClient)

  const paged = validatedPageSize !== undefined
  const tableState = useOrganizationTableState(
    "organizationMembers",
    validatedPageSize ?? ORGANIZATION_TABLE_PAGE_SIZE,
    MEMBER_COLUMN_IDS
  )
  const { columnFilters, globalFilter, pagination, sorting } = tableState
  const roleFilter = String(
    columnFilters.find((filter) => filter.id === "role")?.value ?? "all"
  )
  const previousOrganizationId = useRef<string | undefined>(undefined)

  useEffect(() => {
    const organizationId = activeOrganization?.id
    if (!organizationId) return
    if (
      previousOrganizationId.current &&
      previousOrganizationId.current !== organizationId
    ) {
      tableState.setPagination((current) => ({ ...current, pageIndex: 0 }))
    }
    previousOrganizationId.current = organizationId
  }, [activeOrganization?.id, tableState.setPagination])

  const { data: membersData, isPending: membersPending } =
    useListOrganizationMembers(authClient as OrganizationAuthClient, {
      enabled: !paged || tableState.ready,
      placeholderData: paged ? keepPreviousData : undefined,
      query: paged
        ? {
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
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
  const { data: activeMemberRole } = useActiveMemberRole(
    authClient as OrganizationAuthClient
  )
  const { data: session } = useSession(authClient)
  const owners = useListOrganizationMembers(
    authClient as OrganizationAuthClient,
    {
      query: {
        organizationId: activeOrganization?.id,
        filterField: "role",
        filterValue: creatorRole,
        filterOperator: "contains",
        limit: 1
      },
      enabled: Boolean(activeOrganization?.id)
    }
  )

  const canInvite = useHasPermission(authClient as OrganizationAuthClient, {
    permissions: { invitation: ["create"] }
  })
  const canListMemberTeams = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      organizationId: activeOrganization?.id,
      permissions: { member: ["update"] },
      enabled: teams && Boolean(activeOrganization?.id)
    }
  )
  const canDeleteMembers = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      organizationId: activeOrganization?.id,
      permissions: { member: ["delete"] },
      enabled: Boolean(activeOrganization?.id)
    }
  )

  const isPending =
    activeOrganizationPending ||
    membersPending ||
    owners.isPending ||
    canDeleteMembers.isPending ||
    (teams && canListMemberTeams.isPending)

  const [inviteOpen, setInviteOpen] = useState(false)

  const total = membersData?.total ?? membersData?.members.length ?? 0

  useEffect(() => {
    if (!paged || !tableState.ready || !membersData) return

    const lastPageIndex = getClampedTablePageIndex(
      pagination.pageIndex,
      pagination.pageSize,
      total
    )
    if (pagination.pageIndex > lastPageIndex) {
      tableState.setPagination((current) => ({
        ...current,
        pageIndex: lastPageIndex
      }))
    }
  }, [
    membersData,
    paged,
    pagination.pageIndex,
    pagination.pageSize,
    tableState.ready,
    tableState.setPagination,
    total
  ])
  const isOwner = hasMemberRole(activeMemberRole?.role, creatorRole)
  const ownerCount = owners.data?.total ?? owners.data?.members.length
  const showTeams = teams && canListMemberTeams.data?.success === true

  const table = useOrganizationTable<MemberRow, null>(
    {
      atoms: tableState.atoms,
      columns: showTeams ? memberColumns : memberColumnsWithoutTeams,
      data: membersData?.members ?? EMPTY_MEMBERS,
      enableRowSelection: (row) => {
        const targetIsOwner = hasMemberRole(row.original.role, creatorRole)
        return (
          canDeleteMembers.data?.success === true &&
          row.original.userId !== session?.user.id &&
          (isOwner || !targetIsOwner) &&
          !(targetIsOwner && (ownerCount === undefined || ownerCount <= 1))
        )
      },
      globalFilterFn: "includesString",
      getRowId: (member) => member.id,
      manualFiltering: paged,
      manualPagination: paged,
      manualSorting: paged,
      rowCount: paged ? total : undefined
    },
    () => null
  )

  const removeMembers = useRemoveMember(authClient as OrganizationAuthClient)
  const roleFacetRows = table.getColumn("role")?.getFacetedRowModel().flatRows
  const selectedMembers = table.getSelectedRowModel().rows
  const showSelection = canDeleteMembers.data?.success === true

  async function removeSelectedMembers() {
    if (!activeOrganization) return
    const results = await Promise.allSettled(
      selectedMembers.map((row) =>
        removeMembers.mutateAsync({
          memberIdOrEmail: row.original.id,
          organizationId: activeOrganization.id
        })
      )
    )
    const removedCount = results.filter(
      (result) => result.status === "fulfilled"
    ).length
    const failed = results.find((result) => result.status === "rejected")
    if (removedCount > 0)
      toast.success(
        organizationLocalization.membersRemoved.replace(
          "{{count}}",
          String(removedCount)
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

  const membershipLimitReached =
    membershipLimit !== undefined && total >= membershipLimit

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
            isDisabled={canInvite.isPending || membershipLimitReached}
            onPress={() => setInviteOpen(true)}
          >
            {organizationLocalization.inviteMember}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* list-members has no search parameter, so a search box would
              only ever filter the page in front of you. */}
          {!paged && (
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

                {Object.entries(roles).map(([role, label]) => (
                  <Dropdown.Item key={role} id={role} textValue={label}>
                    <Label>
                      {label}
                      {!paged
                        ? ` (${roleFacetRows?.filter((row) => hasMemberRole(row.original.role, role)).length ?? 0})`
                        : ""}
                    </Label>

                    <Dropdown.ItemIndicator />
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <div className="ms-auto">
            <OrganizationTableViewOptions
              columns={[
                {
                  id: "role",
                  label: organizationLocalization.role,
                  visible: table.getColumn("role")?.getIsVisible() ?? true,
                  onVisibleChange: (visible) =>
                    table.getColumn("role")?.toggleVisibility(visible)
                },
                ...(showTeams
                  ? [
                      {
                        id: "teams",
                        label: organizationLocalization.teams,
                        visible:
                          table.getColumn("teams")?.getIsVisible() ?? true,
                        onVisibleChange: (visible: boolean) =>
                          table.getColumn("teams")?.toggleVisibility(visible)
                      }
                    ]
                  : [])
              ]}
              disabled={isPending}
              localization={organizationLocalization}
            />
          </div>
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
              onClick={() => table.getColumn("role")?.setFilterValue(undefined)}
            >
              <Xmark className="size-3" />
            </button>
          </Chip>
        )}

        <OrganizationTableBulkAction
          cancelLabel={localization.settings.cancel}
          confirmLabel={organizationLocalization.removeSelectedMembers}
          description={
            organizationLocalization.removeSelectedMembersDescription
          }
          onConfirm={removeSelectedMembers}
          pending={removeMembers.isPending}
          selectedCount={selectedMembers.length}
          title={organizationLocalization.removeSelectedMembers}
          localization={organizationLocalization}
        />

        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label={organizationLocalization.members}
              onSortChange={(descriptor) =>
                table.setSorting(getTanStackSorting(descriptor, sorting))
              }
              sortDescriptor={getHeroUISortDescriptor(sorting)}
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
                {/* Name and email live on the joined user row, which
                    list-members cannot sort by. */}
                {paged ? (
                  <Table.Column isRowHeader>
                    {organizationLocalization.member}
                  </Table.Column>
                ) : (
                  <Table.Column allowsSorting id="user" isRowHeader>
                    {({ sortDirection }) => (
                      <OrganizationSortableTableHeader
                        column={table.getColumn("user")}
                        interactive={false}
                        nativeSortDirection={sortDirection}
                      >
                        {organizationLocalization.member}
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

                {showTeams && table.getColumn("teams")?.getIsVisible() && (
                  <Table.Column>{organizationLocalization.teams}</Table.Column>
                )}

                <Table.Column className="text-end">
                  {organizationLocalization.actions}
                </Table.Column>
              </Table.Header>

              <Table.Body>
                {isPending ? (
                  <OrganizationMemberRowSkeleton showTeams={showTeams} />
                ) : (
                  !!activeOrganization &&
                  table
                    .getRowModel()
                    .rows.map((row) => (
                      <OrganizationMemberRow
                        key={row.original.id}
                        member={row.original}
                        isOwner={isOwner}
                        ownerCount={ownerCount}
                        organization={activeOrganization}
                        selectableRow={showSelection ? row : undefined}
                        showRole={table.getColumn("role")?.getIsVisible()}
                        showTeams={
                          showTeams &&
                          table.getColumn("teams")?.getIsVisible() === true
                        }
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
