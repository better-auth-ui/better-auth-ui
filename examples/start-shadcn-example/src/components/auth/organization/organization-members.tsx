"use client"

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission,
  useListOrganizationMembers
} from "@better-auth-ui/react/plugins/organization"
import type { Member } from "better-auth/client"
import { ChevronUp, Filter, Search, X } from "lucide-react"
import { type ComponentProps, type ReactNode, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
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
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"

type SortDirection = "ascending" | "descending"

type SortDescriptor = {
  column: string
  direction: SortDirection
}

/** Props for the `OrganizationMembers` component. */
export type OrganizationMembersProps = {
  className?: string
}

/**
 * Organization members table with title, invite control, and per-row actions.
 */
export function OrganizationMembers({
  className,
  ...props
}: OrganizationMembersProps & ComponentProps<"div">) {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)
  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient)
  const { data: membersData, isPending: membersPending } =
    useListOrganizationMembers(authClient)

  const { isPending: updatePermissionPending } = useHasPermission(authClient, {
    permissions: { member: ["update"] }
  })
  const { isPending: deletePermissionPending } = useHasPermission(authClient, {
    permissions: { member: ["delete"] }
  })

  const isPending =
    activeOrganizationPending ||
    membersPending ||
    updatePermissionPending ||
    deletePermissionPending

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()
  const [roleFilter, setRoleFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filteredMembers = useMemo(() => {
    return membersData?.members.filter(
      (member) =>
        (roleFilter === "all" || member.role === roleFilter) &&
        (member.user.name.toLowerCase().includes(search.toLowerCase()) ||
          member.user.email.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, membersData?.members, roleFilter])

  const sortedMembers = useMemo(() => {
    if (!sortDescriptor) return filteredMembers
    if (!filteredMembers) return filteredMembers

    return [...filteredMembers].sort((a, b) => {
      const col = sortDescriptor.column as keyof Member | "user"
      const first =
        col === "user" ? a.user.name || a.user.email : String(a[col])
      const second =
        col === "user" ? b.user.name || b.user.email : String(b[col])

      let cmp = first.localeCompare(second)
      if (sortDescriptor.direction === "descending") {
        cmp *= -1
      }

      return cmp
    })
  }, [sortDescriptor, filteredMembers])

  const [inviteOpen, setInviteOpen] = useState(false)

  const isOwner = membersData?.members.some(
    (member) => member.role === "owner" && member.userId === session?.user.id
  )

  function toggleSort(column: string) {
    setSortDescriptor((current) => {
      if (current?.column !== column) {
        return { column, direction: "ascending" }
      }
      if (current.direction === "ascending") {
        return { column, direction: "descending" }
      }
      return undefined
    })
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-end justify-between gap-3">
        <h3 className="truncate text-sm font-semibold">
          {organizationLocalization.members}
        </h3>

        <Button
          className="shrink-0"
          size="sm"
          disabled={isPending}
          onClick={() => setInviteOpen(true)}
        >
          {organizationLocalization.inviteMember}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <InputGroup className="min-w-0 sm:w-[220px]">
            <InputGroupInput
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={organizationLocalization.search}
              placeholder={organizationLocalization.search}
              disabled={isPending}
            />

            <InputGroupAddon>
              <Search className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              disabled={isPending}
            >
              <Filter />

              {organizationLocalization.role}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <DropdownMenuRadioItem value="all">
                  {organizationLocalization.all}
                </DropdownMenuRadioItem>

                {Object.entries(roles).map(([role, label]) => (
                  <DropdownMenuRadioItem key={role} value={role}>
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {roleFilter !== "all" && (
          <Badge variant="secondary" className="w-fit gap-1">
            {organizationLocalization.role}:{" "}
            <span className="capitalize">
              {roles?.[roleFilter] ?? roleFilter}
            </span>
            <button
              type="button"
              aria-label={organizationLocalization.clear}
              className="inline-flex cursor-pointer items-center text-muted-foreground hover:text-foreground"
              onClick={() => setRoleFilter("all")}
            >
              <X className="size-3" />
            </button>
          </Badge>
        )}

        <Card className="p-0">
          <Table aria-label={organizationLocalization.members}>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortDirection={
                    sortDescriptor?.column === "user"
                      ? sortDescriptor.direction
                      : undefined
                  }
                  onClick={() => toggleSort("user")}
                >
                  {organizationLocalization.member}
                </SortableTableHead>

                <SortableTableHead
                  sortDirection={
                    sortDescriptor?.column === "role"
                      ? sortDescriptor.direction
                      : undefined
                  }
                  onClick={() => toggleSort("role")}
                >
                  {organizationLocalization.role}
                </SortableTableHead>

                <TableHead className="text-end">
                  {organizationLocalization.actions}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                <OrganizationMemberRowSkeleton />
              ) : (
                !!activeOrganization &&
                sortedMembers?.map((member) => (
                  <OrganizationMemberRow
                    key={member.id}
                    member={member}
                    isOwner={isOwner}
                    organization={activeOrganization}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}

function SortableTableHead({
  children,
  sortDirection,
  onClick
}: {
  children: ReactNode
  sortDirection?: SortDirection
  onClick: () => void
}) {
  return (
    <TableHead aria-sort={sortDirection ?? "none"}>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2 text-left font-medium"
      >
        {children}

        {!!sortDirection && (
          <ChevronUp
            className={cn(
              "size-3 transition-transform duration-100 ease-out",
              sortDirection === "descending" ? "rotate-180" : ""
            )}
          />
        )}
      </button>
    </TableHead>
  )
}
