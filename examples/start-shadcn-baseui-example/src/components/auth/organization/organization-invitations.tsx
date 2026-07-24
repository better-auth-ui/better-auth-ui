"use client"

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins"
import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useListOrganizationInvitations
} from "@better-auth-ui/react"
import { ChevronUp, Filter, Search, X } from "lucide-react"
import { type ComponentProps, type ReactNode, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
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
import { OrganizationInvitationRow } from "./organization-invitation-row"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"
import { OrganizationInvitationsEmpty } from "./organization-invitations-empty"

type SortDirection = "ascending" | "descending"

type SortDescriptor = {
  column: string
  direction: SortDirection
}

/** Props for the `OrganizationInvitations` component. */
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

  const { isPending: invitationPermissionPending } = useHasPermission(
    authClient as OrganizationAuthClient,
    {
      permissions: { invitation: ["cancel"] }
    }
  )

  const isPending = invitationsPending || invitationPermissionPending

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filteredInvitations = useMemo(() => {
    return invitations?.filter(
      (invitation) =>
        (roleFilter === "all" || invitation.role === roleFilter) &&
        (statusFilter === "all" || invitation.status === statusFilter) &&
        invitation.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, invitations, roleFilter, statusFilter])

  const sortedInvitations = useMemo(() => {
    if (!sortDescriptor) return filteredInvitations
    if (!filteredInvitations) return filteredInvitations

    return [...filteredInvitations].sort((a, b) => {
      const col = sortDescriptor.column as keyof typeof a
      let cmp = 0

      if (col === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else {
        cmp = String(a[col]).localeCompare(String(b[col]))
      }

      if (sortDescriptor.direction === "descending") {
        cmp *= -1
      }

      return cmp
    })
  }, [sortDescriptor, filteredInvitations])

  const [inviteOpen, setInviteOpen] = useState(false)

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
      <h3 className="truncate text-sm font-semibold">
        {organizationLocalization.invitations}
      </h3>

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

                {Object.entries(roles).map(([key, label]) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              disabled={isPending}
            >
              <Filter />

              {organizationLocalization.status}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem value="all">
                  {organizationLocalization.all}
                </DropdownMenuRadioItem>

                {(["pending", "accepted", "rejected", "canceled"] as const).map(
                  (status) => (
                    <DropdownMenuRadioItem key={status} value={status}>
                      {organizationLocalization[
                        status as keyof OrganizationLocalization
                      ] ?? status}
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(roleFilter !== "all" || statusFilter !== "all") && (
          <div className="flex flex-wrap gap-2">
            {roleFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
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

            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {organizationLocalization.status}:{" "}
                {organizationLocalization[
                  statusFilter as keyof OrganizationLocalization
                ] ?? statusFilter}
                <button
                  type="button"
                  aria-label={organizationLocalization.clear}
                  className="inline-flex cursor-pointer items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setStatusFilter("all")}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <Card className="p-0">
          <Table aria-label={organizationLocalization.invitations}>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortDirection={
                    sortDescriptor?.column === "email"
                      ? sortDescriptor.direction
                      : undefined
                  }
                  onClick={() => toggleSort("email")}
                >
                  {localization.auth.email}
                </SortableTableHead>

                <SortableTableHead
                  sortDirection={
                    sortDescriptor?.column === "createdAt"
                      ? sortDescriptor.direction
                      : undefined
                  }
                  onClick={() => toggleSort("createdAt")}
                >
                  {organizationLocalization.invitedAt}
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

                <SortableTableHead
                  sortDirection={
                    sortDescriptor?.column === "status"
                      ? sortDescriptor.direction
                      : undefined
                  }
                  onClick={() => toggleSort("status")}
                >
                  {organizationLocalization.status}
                </SortableTableHead>

                <TableHead className="text-end">
                  {organizationLocalization.actions}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending ? (
                <OrganizationInvitationRowSkeleton />
              ) : !sortedInvitations?.length ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <OrganizationInvitationsEmpty
                      onInvitePress={() => setInviteOpen(true)}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                sortedInvitations.map((invitation) => (
                  <OrganizationInvitationRow
                    key={invitation.id}
                    invitation={invitation}
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
