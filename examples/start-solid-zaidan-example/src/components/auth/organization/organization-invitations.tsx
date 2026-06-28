import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useListOrganizationInvitations } from "@better-auth-ui/solid/plugins/organization"
import { ChevronUp, Filter, Search, X } from "lucide-solid"
import { createMemo, createSignal, For, type JSX, Show } from "solid-js"
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

export type OrganizationInvitationsProps = {
  class?: string
}

type RoleMap = Record<string, string>
type InvitationSort = "none" | "email" | "createdAt" | "role" | "status"
type InvitationSortColumn = Exclude<InvitationSort, "none">
type SortDirection = "ascending" | "descending"

type SortDescriptor = {
  column: InvitationSortColumn
  direction: SortDirection
}

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
  owner: "Owner"
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
  role?: string | null
  status?: string | null
}

function formatStatus(status?: string | null) {
  if (!status) return "Pending"

  return status.charAt(0).toUpperCase() + status.slice(1)
}

function SortableTableHead(props: {
  children: JSX.Element
  onClick: () => void
  sortDirection?: SortDirection
}) {
  return (
    <TableHead aria-sort={props.sortDirection ?? "none"}>
      <button
        class="flex w-full items-center gap-2 text-left font-medium"
        onClick={props.onClick}
        type="button"
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
      </button>
    </TableHead>
  )
}

export function OrganizationInvitations(props: OrganizationInvitationsProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const [invitationSearch, setInvitationSearch] = createSignal("")
  const [invitationRoleFilter, setInvitationRoleFilter] = createSignal("all")
  const [invitationStatusFilter, setInvitationStatusFilter] =
    createSignal("all")
  const [invitationSort, setInvitationSort] =
    createSignal<InvitationSort>("none")
  const [sortDescriptor, setSortDescriptor] = createSignal<
    SortDescriptor | undefined
  >()
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
        invitation.role === invitationRoleFilter()
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
  const invitationDateTime = (invitation: OrganizationInvitation) => {
    if (!invitation.createdAt) return Number.POSITIVE_INFINITY

    const date =
      invitation.createdAt instanceof Date
        ? invitation.createdAt
        : new Date(invitation.createdAt)
    const time = date.getTime()

    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
  }
  const sortInvitations = (
    first: OrganizationInvitation,
    second: OrganizationInvitation
  ) => {
    let comparison = 0

    if (invitationSort() === "email") {
      comparison = (first.email ?? "").localeCompare(second.email ?? "")
    }

    if (invitationSort() === "createdAt") {
      comparison = invitationDateTime(first) - invitationDateTime(second)
    }

    if (invitationSort() === "role") {
      const firstRole = roles()[first.role ?? ""] ?? first.role ?? ""
      const secondRole = roles()[second.role ?? ""] ?? second.role ?? ""

      comparison = firstRole.localeCompare(secondRole)
    }

    if (invitationSort() === "status") {
      comparison = formatStatus(first.status).localeCompare(
        formatStatus(second.status)
      )
    }

    return sortDescriptor()?.direction === "descending"
      ? comparison * -1
      : comparison
  }
  const sortedInvitationRows = () =>
    [...filteredInvitationRows()].sort(sortInvitations)
  const toggleSort = (column: InvitationSortColumn) => {
    setInvitationSort(column)
    setSortDescriptor((current) => {
      if (current?.column !== column) {
        return { column, direction: "ascending" }
      }

      return {
        column,
        direction:
          current.direction === "ascending" ? "descending" : "ascending"
      }
    })
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
                  <button
                    aria-label={`${localization().clear} invitation role filter`}
                    class="rounded-sm p-0.5 hover:bg-muted"
                    onClick={() => setInvitationRoleFilter("all")}
                    type="button"
                  >
                    <X class="size-3" />
                  </button>
                </Badge>
              </Show>
              <Show when={invitationStatusFilter() !== "all"}>
                <Badge class="gap-1 pr-1" variant="secondary">
                  {localization().status}: {selectedStatusLabel()}
                  <button
                    aria-label={`${localization().clear} invitation status filter`}
                    class="rounded-sm p-0.5 hover:bg-muted"
                    onClick={() => setInvitationStatusFilter("all")}
                    type="button"
                  >
                    <X class="size-3" />
                  </button>
                </Badge>
              </Show>
            </div>
          </Show>
          <Card class="z-card-padding-none">
            <Table aria-label="Invitations">
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    onClick={() => toggleSort("email")}
                    sortDirection={
                      sortDescriptor()?.column === "email"
                        ? sortDescriptor()?.direction
                        : undefined
                    }
                  >
                    Email
                  </SortableTableHead>
                  <SortableTableHead
                    onClick={() => toggleSort("createdAt")}
                    sortDirection={
                      sortDescriptor()?.column === "createdAt"
                        ? sortDescriptor()?.direction
                        : undefined
                    }
                  >
                    Invited
                  </SortableTableHead>
                  <SortableTableHead
                    onClick={() => toggleSort("role")}
                    sortDirection={
                      sortDescriptor()?.column === "role"
                        ? sortDescriptor()?.direction
                        : undefined
                    }
                  >
                    {localization().role}
                  </SortableTableHead>
                  <SortableTableHead
                    onClick={() => toggleSort("status")}
                    sortDirection={
                      sortDescriptor()?.column === "status"
                        ? sortDescriptor()?.direction
                        : undefined
                    }
                  >
                    {localization().status}
                  </SortableTableHead>
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
                  <For each={sortedInvitationRows()}>
                    {(invitation) => (
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
        </Show>
      </Show>
    </div>
  )
}
