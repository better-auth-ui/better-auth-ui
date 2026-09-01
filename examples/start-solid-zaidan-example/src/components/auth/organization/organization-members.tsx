import {
  hasMemberRole,
  mergeOrganizationRoleLabels,
  type OrganizationAuthClient,
  type OrganizationLocalization,
  type OrganizationRolesAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useActiveMemberRole,
  useHasPermission,
  useListOrganizationMembers,
  useListRoles
} from "@better-auth-ui/solid/plugins/organization"
import type { PaginationState, SortingState } from "@tanstack/solid-table"
import { Filter, Search, X } from "lucide-solid"
import { createEffect, createMemo, createSignal, For, on, Show } from "solid-js"
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
import { OrganizationTablePagination } from "./organization-table-pagination"

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
    { id: "name" }
  ),
  memberColumnHelper.accessor((member) => member.role ?? "", { id: "role" })
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
  paginationRange: "{{from}}–{{to}} of {{total}}"
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
  const [memberSearch, setMemberSearch] = createSignal("")
  const [memberRoleFilter, setMemberRoleFilter] = createSignal("all")
  const [sorting, setSorting] = createSignal<SortingState>([])
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: validatePageSize(props.pageSize) ?? ORGANIZATION_TABLE_PAGE_SIZE
  })
  const pageSize = () => validatePageSize(props.pageSize)
  const paged = () => pageSize() !== undefined

  const members = useListOrganizationMembers(auth.authClient, () => {
    const size = pageSize()

    if (size === undefined) return {}

    const descriptor = sorting()[0]

    return {
      query: {
        limit: size,
        offset: pagination().pageIndex * size,
        organizationId: props.organizationId,
        ...(memberRoleFilter() === "all"
          ? {}
          : {
              filterField: "role",
              filterValue: memberRoleFilter(),
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
  const selectedRoleLabel = () =>
    roles()[memberRoleFilter()] ?? memberRoleFilter()
  const normalizedMemberSearch = () => memberSearch().trim().toLowerCase()
  const filteredMemberRows = () => {
    // The server already applied the role filter when paging, and it has no
    // parameter for name or email search, so both stay here only in the
    // unpaged mode where the whole list is present.
    if (paged()) return memberRows()

    return memberRows().filter((member) => {
      const roleMatches =
        memberRoleFilter() === "all" ||
        hasMemberRole(member.role, memberRoleFilter())
      const search = normalizedMemberSearch()

      if (!search) return roleMatches

      const searchableMember = [
        member.user?.name,
        member.user?.email,
        member.role
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return roleMatches && searchableMember.includes(search)
    })
  }
  const isOwner = () =>
    hasMemberRole(activeMemberRole.data?.role, config.creatorRole)
  const ownerCount = () => owners.data?.total ?? owners.data?.members.length
  const showTeams = () =>
    config.teams && canListMemberTeams.data?.success === true

  const total = () => members.data?.total ?? memberRows().length
  const table = createOrganizationTable({
    columns: memberColumns,
    get data() {
      return filteredMemberRows()
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
      return { pagination: pagination(), sorting: sorting() }
    },
    getRowId: (member) => member.id,
    onPaginationChange: setPagination,
    onSortingChange: setSorting
  })

  // Any change to what the server is being asked for invalidates the cursor.
  createEffect(
    on(
      () => [memberRoleFilter(), sorting(), props.organizationId] as const,
      () => setPagination((current) => ({ ...current, pageIndex: 0 })),
      { defer: true }
    )
  )

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
                    setMemberSearch(event.currentTarget.value)
                  }
                  placeholder={localization().search}
                  type="search"
                  value={memberSearch()}
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
                  onChange={setMemberRoleFilter}
                  value={memberRoleFilter()}
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
          </div>
          <Show when={memberRoleFilter() !== "all"}>
            <div class="flex flex-wrap gap-2">
              <Show when={memberRoleFilter() !== "all"}>
                <Badge class="gap-1 pr-1" variant="secondary">
                  {localization().role}: {selectedRoleLabel()}
                  <Button
                    aria-label={`${localization().clear} member role filter`}
                    class="size-4 rounded-sm"
                    onClick={() => setMemberRoleFilter("all")}
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
            <Table aria-label="Members">
              <TableHeader>
                <TableRow>
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
                  <OrganizationSortableTableHead
                    column={table.getColumn("role")}
                  >
                    {localization().role}
                  </OrganizationSortableTableHead>
                  <Show when={showTeams()}>
                    <TableHead>{localization().teams}</TableHead>
                  </Show>
                  <TableHead class="z-table-head-align-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Show
                  when={filteredMemberRows().length > 0}
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
                    {({ original: member }) => (
                      <OrganizationMemberRow
                        isOwner={isOwner()}
                        localization={localization()}
                        member={member}
                        ownerCount={ownerCount()}
                        roles={roles()}
                        showTeams={showTeams()}
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
            onNextPage={table.nextPage}
            onPreviousPage={table.previousPage}
            pageIndex={pagination().pageIndex}
            pageSize={pagination().pageSize}
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
