import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useListOrganizationInvitations
} from "@better-auth-ui/react"
import { Funnel, Xmark } from "@gravity-ui/icons"
import {
  Button,
  Chip,
  cn,
  Dropdown,
  Label,
  SearchField,
  type SortDescriptor,
  Table
} from "@heroui/react"
import { type ComponentProps, useMemo, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationInvitationTableRow } from "./organization-invitation-row"
import { OrganizationInvitationRowSkeleton } from "./organization-invitation-row-skeleton"
import { OrganizationInvitationsEmpty } from "./organization-invitations-empty"

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
            <Table.Content
              aria-label={organizationLocalization.invitations}
              sortDescriptor={sortDescriptor}
              onSortChange={(descriptor) => {
                const shouldReset =
                  sortDescriptor?.column === descriptor.column &&
                  descriptor.direction === "ascending"
                setSortDescriptor(shouldReset ? undefined : descriptor)
              }}
            >
              <Table.Header>
                <Table.Column allowsSorting isRowHeader id="email">
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {localization.auth.email}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>

                <Table.Column allowsSorting id="createdAt">
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {organizationLocalization.invitedAt}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>

                <Table.Column allowsSorting id="role">
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {organizationLocalization.role}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>

                <Table.Column allowsSorting id="status">
                  {({ sortDirection }) => (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {organizationLocalization.status}
                    </Table.SortableColumnHeader>
                  )}
                </Table.Column>

                <Table.Column className="text-end">
                  {organizationLocalization.actions}
                </Table.Column>
              </Table.Header>

              <Table.Body
                renderEmptyState={() => (
                  <OrganizationInvitationsEmpty
                    onInvitePress={() => setInviteOpen(true)}
                  />
                )}
              >
                {isPending ? (
                  <OrganizationInvitationRowSkeleton />
                ) : (
                  sortedInvitations?.map((invitation) => (
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
      </div>

      <InviteMemberDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
