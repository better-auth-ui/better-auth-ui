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
import { Funnel, Xmark } from "@gravity-ui/icons"
import {
  Button,
  Chip,
  cn,
  Dropdown,
  Label,
  SearchField,
  Table
} from "@heroui/react"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import type { Invitation } from "better-auth/client"
import { type ComponentProps, useMemo, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationInvitationTableRow } from "./organization-invitation-row"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"
import { OrganizationInvitationsEmpty } from "./organization-invitations-empty"
import { OrganizationSortableTableColumn } from "./organization-sortable-table-column"
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
          <SearchField
            className="min-w-0"
            aria-label={organizationLocalization.search}
            value={search}
            onChange={setSearch}
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
                  setRoleFilter(key ?? "all")
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
                    <Label>{label}</Label>

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
                  setStatusFilter(key ?? "all")
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
                        ] ?? status}
                      </Label>

                      <Dropdown.ItemIndicator />
                    </Dropdown.Item>
                  )
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
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
                  onClick={() => setRoleFilter("all")}
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
                  onClick={() => setStatusFilter("all")}
                >
                  <Xmark className="size-3" />
                </button>
              </Chip>
            )}
          </div>
        )}

        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label={organizationLocalization.invitations}>
              <Table.Header>
                <OrganizationSortableTableColumn
                  column={table.getColumn("email")}
                  isRowHeader
                >
                  {localization.auth.email}
                </OrganizationSortableTableColumn>

                <OrganizationSortableTableColumn
                  column={table.getColumn("createdAt")}
                >
                  {organizationLocalization.invitedAt}
                </OrganizationSortableTableColumn>

                <OrganizationSortableTableColumn
                  column={table.getColumn("role")}
                >
                  {organizationLocalization.role}
                </OrganizationSortableTableColumn>

                <OrganizationSortableTableColumn
                  column={table.getColumn("status")}
                >
                  {organizationLocalization.status}
                </OrganizationSortableTableColumn>

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
                    .rows.map(({ original: invitation }) => (
                      <OrganizationInvitationTableRow
                        key={invitation.id}
                        invitation={invitation}
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
          onNextPage={table.nextPage}
          onPreviousPage={table.previousPage}
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
