import {
  hasMemberRole,
  mergeOrganizationRoleLabels,
  type OrganizationAuthClient,
  type OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useActiveMemberRole,
  useListOrganizationMembers,
  useListRoles
} from "@better-auth-ui/solid/plugins/organization"
import { ChevronUp, Filter, Search, X } from "lucide-solid"
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  on,
  Show
} from "solid-js"
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

type RoleMap = Record<string, string>
type MemberSort = "name" | "role"
type SortDirection = "ascending" | "descending"

type SortDescriptor = {
  column: MemberSort
  direction: SortDirection
}

const fallbackLocalization = {
  changeMemberRole: "Change member role",
  memberRoleUpdated: "Member role updated",
  removeMember: "Remove member",
  removeMemberWarning:
    "Are you sure you want to remove this member from the organization? They will lose access immediately.",
  memberRemoved: "Member removed",
  leaveOrganization: "Leave organization",
  leaveOrganizationDescription:
    "Leave this organization and lose access to its data and resources. You'll need a new invitation to rejoin.",
  leftOrganization: "You left the organization",
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
  | "memberRoleUpdated"
  | "removeMember"
  | "removeMemberWarning"
  | "memberRemoved"
  | "leaveOrganization"
  | "leaveOrganizationDescription"
  | "leftOrganization"
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

function SortableTableHead(props: {
  children: JSX.Element
  onClick: () => void
  sortDirection?: SortDirection
}) {
  return (
    <TableHead aria-sort={props.sortDirection ?? "none"}>
      <Button
        class="h-auto w-full justify-start p-0 font-medium hover:bg-transparent"
        onClick={props.onClick}
        size="sm"
        type="button"
        variant="ghost"
      >
        {props.children}
        <Show when={props.sortDirection}>
          <ChevronUp
            class={cn(
              "size-3 transition-transform duration-100 ease-out",
              props.sortDirection === "descending" && "rotate-180"
            )}
          />
        </Show>
      </Button>
    </TableHead>
  )
}

export function OrganizationMembers(props: OrganizationMembersProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const [inviteOpen, setInviteOpen] = createSignal(false)
  const [memberSearch, setMemberSearch] = createSignal("")
  const [memberRoleFilter, setMemberRoleFilter] = createSignal("all")
  const [memberSort, setMemberSort] = createSignal<MemberSort>("name")
  const [sortDescriptor, setSortDescriptor] = createSignal<SortDescriptor>({
    column: "name",
    direction: "ascending"
  })
  const [page, setPage] = createSignal(0)
  const pageSize = () => validatePageSize(props.pageSize)
  const paged = () => pageSize() !== undefined

  const members = useListOrganizationMembers(auth.authClient, () => {
    const size = pageSize()

    if (size === undefined) return {}

    const descriptor = sortDescriptor()

    return {
      query: {
        limit: size,
        offset: page() * size,
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
        ...(descriptor.column === "role"
          ? {
              sortBy: "role",
              sortDirection:
                descriptor.direction === "descending"
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
  const dynamicRoles = useListRoles(auth.authClient, () => ({
    query: { organizationId: props.organizationId },
    enabled: config.dynamicAccessControl?.enabled === true
  }))
  const memberRows = () => (members.data?.members ?? []) as OrganizationMember[]
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | {
          localization?: Pick<
            OrganizationLocalization,
            | "changeMemberRole"
            | "memberRoleUpdated"
            | "removeMember"
            | "removeMemberWarning"
            | "memberRemoved"
            | "leaveOrganization"
            | "leaveOrganizationDescription"
            | "leftOrganization"
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
  const sortMembers = (
    first: OrganizationMember,
    second: OrganizationMember
  ) => {
    let comparison = 0

    if (memberSort() === "role") {
      const firstRole = roles()[first.role ?? ""] ?? first.role ?? ""
      const secondRole = roles()[second.role ?? ""] ?? second.role ?? ""

      comparison = firstRole.localeCompare(secondRole)
    }

    if (memberSort() === "name") {
      const firstName = first.user?.name ?? first.user?.email ?? ""
      const secondName = second.user?.name ?? second.user?.email ?? ""

      comparison = firstName.localeCompare(secondName)
    }

    return sortDescriptor().direction === "descending"
      ? comparison * -1
      : comparison
  }
  const sortedMemberRows = () =>
    paged() ? filteredMemberRows() : [...filteredMemberRows()].sort(sortMembers)
  const toggleSort = (column: MemberSort) => {
    setMemberSort(column)
    setSortDescriptor((current) => {
      if (current.column !== column) {
        return { column, direction: "ascending" }
      }

      return {
        column,
        direction:
          current.direction === "ascending" ? "descending" : "ascending"
      }
    })
  }
  const isOwner = () => hasMemberRole(activeMemberRole.data?.role, "owner")

  const total = () => members.data?.total ?? memberRows().length
  const pageStart = () => page() * (pageSize() ?? 0)
  const pageEnd = () => pageStart() + sortedMemberRows().length
  const hasNextPage = () => pageEnd() < total()

  // Any change to what the server is being asked for invalidates the cursor.
  createEffect(
    on(
      () =>
        [
          memberRoleFilter(),
          sortDescriptor().column,
          sortDescriptor().direction,
          props.organizationId
        ] as const,
      () => setPage(0),
      { defer: true }
    )
  )

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <div class="flex items-end justify-between gap-3">
        <h3 class="truncate text-sm font-semibold">Members</h3>
        <Button
          class="shrink-0"
          disabled={
            config.membershipLimit !== undefined &&
            total() >= config.membershipLimit
          }
          onClick={() => setInviteOpen(true)}
          size="sm"
          type="button"
        >
          Invite member
        </Button>
      </div>
      <Show
        when={!members.isPending}
        fallback={
          <Card class="z-card-padding-none">
            <Table>
              <TableBody>
                <OrganizationMemberRowSkeleton />
                <OrganizationMemberRowSkeleton />
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
                    <SortableTableHead
                      onClick={() => toggleSort("name")}
                      sortDirection={
                        sortDescriptor().column === "name"
                          ? sortDescriptor().direction
                          : undefined
                      }
                    >
                      {localization().member}
                    </SortableTableHead>
                  </Show>
                  <SortableTableHead
                    onClick={() => toggleSort("role")}
                    sortDirection={
                      sortDescriptor().column === "role"
                        ? sortDescriptor().direction
                        : undefined
                    }
                  >
                    {localization().role}
                  </SortableTableHead>
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
                        colSpan={3}
                      >
                        No members match the current filters.
                      </TableCell>
                    </TableRow>
                  }
                >
                  <For each={sortedMemberRows()}>
                    {(member) => (
                      <OrganizationMemberRow
                        isOwner={isOwner()}
                        localization={localization()}
                        member={member}
                        roles={roles()}
                      />
                    )}
                  </For>
                </Show>
              </TableBody>
            </Table>
          </Card>

          <Show when={paged() && total() > 0}>
            <div class="flex items-center justify-between gap-3">
              <p class="text-muted-foreground text-sm tabular-nums">
                {localization()
                  .paginationRange.replace("{{from}}", String(pageStart() + 1))
                  .replace("{{to}}", String(pageEnd()))
                  .replace("{{total}}", String(total()))}
              </p>

              <div class="flex gap-2">
                <Button
                  disabled={page() === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {localization().previousPage}
                </Button>

                <Button
                  disabled={!hasNextPage()}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {localization().nextPage}
                </Button>
              </div>
            </div>
          </Show>
        </Show>
      </Show>
      <InviteMemberDialog open={inviteOpen()} onOpenChange={setInviteOpen} />
    </div>
  )
}
