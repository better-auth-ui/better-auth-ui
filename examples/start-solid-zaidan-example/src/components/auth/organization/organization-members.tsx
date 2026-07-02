import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useSession } from "@better-auth-ui/solid"
import { useListOrganizationMembers } from "@better-auth-ui/solid/plugins/organization"
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
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"

export type OrganizationMembersProps = {
  class?: string
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
  owner: "Owner"
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

export function OrganizationMembers(props: OrganizationMembersProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const [inviteOpen, setInviteOpen] = createSignal(false)
  const [memberSearch, setMemberSearch] = createSignal("")
  const [memberRoleFilter, setMemberRoleFilter] = createSignal("all")
  const [memberSort, setMemberSort] = createSignal<MemberSort>("name")
  const [sortDescriptor, setSortDescriptor] = createSignal<SortDescriptor>({
    column: "name",
    direction: "ascending"
  })
  const session = useSession(auth.authClient)
  const members = useListOrganizationMembers(auth.authClient)
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
    roles()[memberRoleFilter()] ?? memberRoleFilter()
  const normalizedMemberSearch = () => memberSearch().trim().toLowerCase()
  const filteredMemberRows = () =>
    memberRows().filter((member) => {
      const roleMatches =
        memberRoleFilter() === "all" || member.role === memberRoleFilter()
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
  const sortedMemberRows = () => [...filteredMemberRows()].sort(sortMembers)
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
  const isOwner = () =>
    memberRows().some(
      (member) =>
        member.role === "owner" && member.userId === session.data?.user.id
    )

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <div class="flex items-end justify-between gap-3">
        <h3 class="truncate text-sm font-semibold">Members</h3>
        <Button
          class="shrink-0"
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
            <InputGroup class="min-w-0 sm:w-[220px]">
              <InputGroupAddon>
                <Search class="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label={localization().search}
                onInput={(event) => setMemberSearch(event.currentTarget.value)}
                placeholder={localization().search}
                type="search"
                value={memberSearch()}
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
                  <button
                    aria-label={`${localization().clear} member role filter`}
                    class="rounded-sm p-0.5 hover:bg-muted"
                    onClick={() => setMemberRoleFilter("all")}
                    type="button"
                  >
                    <X class="size-3" />
                  </button>
                </Badge>
              </Show>
            </div>
          </Show>
          <Card class="z-card-padding-none">
            <Table aria-label="Members">
              <TableHeader>
                <TableRow>
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
        </Show>
      </Show>
      <InviteMemberDialog open={inviteOpen()} onOpenChange={setInviteOpen} />
    </div>
  )
}
