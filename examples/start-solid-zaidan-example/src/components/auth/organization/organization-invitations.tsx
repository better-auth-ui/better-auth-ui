import {
  hasMemberRole,
  type OrganizationAuthClient,
  type OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useListOrganizationInvitations } from "@better-auth-ui/solid/plugins/organization"
import type { PaginationState, SortingState } from "@tanstack/solid-table"
import { Filter, Search, X } from "lucide-solid"
import { createMemo, createSignal, For, Show } from "solid-js"
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
import { OrganizationTablePagination } from "./organization-table-pagination"

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
  paginationRange: "{{from}}–{{to}} of {{total}}"
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
    id: "email"
  }),
  invitationColumnHelper.accessor(
    (invitation) =>
      invitation.createdAt
        ? new Date(invitation.createdAt).getTime()
        : Number.POSITIVE_INFINITY,
    { id: "createdAt" }
  ),
  invitationColumnHelper.accessor((invitation) => invitation.role ?? "", {
    id: "role"
  }),
  invitationColumnHelper.accessor((invitation) => invitation.status ?? "", {
    id: "status"
  })
])

function formatStatus(status?: string | null) {
  if (!status) return "Pending"

  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function OrganizationInvitations(props: OrganizationInvitationsProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const [invitationSearch, setInvitationSearch] = createSignal("")
  const [invitationRoleFilter, setInvitationRoleFilter] = createSignal("all")
  const [invitationStatusFilter, setInvitationStatusFilter] =
    createSignal("all")
  const [sorting, setSorting] = createSignal<SortingState>([])
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: ORGANIZATION_TABLE_PAGE_SIZE
  })
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
          >
          roles?: RoleMap
        }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? fallbackLocalization
  const roles = createMemo(
    () => organizationPluginConfig()?.roles ?? fallbackRoles
  )
  const selectedRoleLabel = () =>
    roles()[invitationRoleFilter()] ?? invitationRoleFilter()
  const selectedStatusLabel = () =>
    invitationStatusFilter() === "all"
      ? localization().all
      : invitationStatusLabel(
          invitationStatusFilter() as (typeof invitationStatuses)[number]
        )
  const normalizedInvitationSearch = () =>
    invitationSearch().trim().toLowerCase()
  const filteredInvitationRows = () =>
    invitationRows().filter((invitation) => {
      const roleMatches =
        invitationRoleFilter() === "all" ||
        hasMemberRole(invitation.role, invitationRoleFilter())
      const statusMatches =
        invitationStatusFilter() === "all" ||
        invitation.status === invitationStatusFilter()
      const search = normalizedInvitationSearch()

      if (!search) return roleMatches && statusMatches

      return (
        roleMatches &&
        statusMatches &&
        (invitation.email?.toLowerCase().includes(search) ?? false)
      )
    })
  const invitationStatusLabel = (status: (typeof invitationStatuses)[number]) =>
    localization()[status] ?? formatStatus(status)
  const table = createOrganizationTable({
    columns: invitationColumns,
    get data() {
      return filteredInvitationRows()
    },
    get state() {
      return { pagination: pagination(), sorting: sorting() }
    },
    getRowId: (invitation) => invitation.id,
    onPaginationChange: setPagination,
    onSortingChange: setSorting
  })

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
                  setInvitationSearch(event.currentTarget.value)
                }
                placeholder={localization().search}
                type="search"
                value={invitationSearch()}
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
                  onChange={setInvitationRoleFilter}
                  value={invitationRoleFilter()}
                >
                  <DropdownMenuRadioItem value="all">
                    {localization().all}
                  </DropdownMenuRadioItem>
                  <For each={Object.entries(roles())}>
                    {([role, label]) => (
                      <DropdownMenuRadioItem value={role}>
                        {label}
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
                  onChange={setInvitationStatusFilter}
                  value={invitationStatusFilter()}
                >
                  <DropdownMenuRadioItem value="all">
                    {localization().all}
                  </DropdownMenuRadioItem>
                  <For each={invitationStatuses}>
                    {(status) => (
                      <DropdownMenuRadioItem value={status}>
                        {invitationStatusLabel(status)}
                      </DropdownMenuRadioItem>
                    )}
                  </For>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    onClick={() => setInvitationRoleFilter("all")}
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
                    onClick={() => setInvitationStatusFilter("all")}
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
          <Card class="z-card-padding-none">
            <Table aria-label="Invitations">
              <TableHeader>
                <TableRow>
                  <OrganizationSortableTableHead
                    column={table.getColumn("email")}
                  >
                    Email
                  </OrganizationSortableTableHead>
                  <OrganizationSortableTableHead
                    column={table.getColumn("createdAt")}
                  >
                    Invited
                  </OrganizationSortableTableHead>
                  <OrganizationSortableTableHead
                    column={table.getColumn("role")}
                  >
                    {localization().role}
                  </OrganizationSortableTableHead>
                  <OrganizationSortableTableHead
                    column={table.getColumn("status")}
                  >
                    {localization().status}
                  </OrganizationSortableTableHead>
                  <TableHead class="z-table-head-align-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Show
                  when={filteredInvitationRows().length > 0}
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
                    {({ original: invitation }) => (
                      <OrganizationInvitationRow
                        invitation={invitation}
                        roles={roles()}
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
            onNextPage={table.nextPage}
            onPreviousPage={table.previousPage}
            pageIndex={pagination().pageIndex}
            pageSize={pagination().pageSize}
            rowCount={table.getRowCount()}
            visibleRowCount={table.getRowModel().rows.length}
          />
        </Show>
      </Show>
    </div>
  )
}
