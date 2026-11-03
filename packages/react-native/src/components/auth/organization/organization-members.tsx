import { keepPreviousData } from "@tanstack/react-query"
import { useOrganizationTableState } from "./organization-table-state"
import {
  hasMemberRole,
  memberRoleLabels,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useActiveMemberRole,
  useListOrganizationMembers,
  useHasPermission,
  useRemoveMember
} from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { SearchField } from "../../../primitives/inputs-extra"
import { Select } from "../../../primitives/menu"
import { Box, Txt } from "../../../primitives/styled"
import { InviteMemberDialog } from "./invite-member-dialog"
import { OrganizationMemberRow } from "./organization-member-row"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"
import { useOrganizationRoleLabels } from "./role-picker"
import {
  NativeListTools,
  NativeListPagination,
  useNativeList
} from "./list-tools"
import { useAllOrganizationMembers } from "./use-all-members"

export type OrganizationMembersProps = SettingsViewProps & {
  /** Move pagination and role filtering onto the server when supplied. */
  pageSize?: number
}
export function OrganizationMembers({
  pageSize,
  ...props
}: OrganizationMembersProps) {
  if (pageSize !== undefined && (!Number.isInteger(pageSize) || pageSize <= 0))
    throw new RangeError("pageSize must be a positive integer")
  const { authClient, localization: common } = useAuth()
  const { localization, creatorRole, modelFields } =
    useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationAuthClient
  const session = useSession(authClient)
  const organization = useActiveOrganization(client)
  const id = organization.data?.id
  const roles = useOrganizationRoleLabels(id)
  const invite = useHasPermission(client, {
    organizationId: id,
    permissions: { invitation: ["create"] }
  })
  const removePermission = useHasPermission(client, {
    organizationId: id,
    permissions: { member: ["delete"] }
  })
  const remove = useRemoveMember(client)
  const tableState = useOrganizationTableState(
    `organizationMembers:${id ?? ""}`,
    pageSize
  )
  const { globalFilter: search, setGlobalFilter: setSearch } = tableState
  const role = String(
    tableState.columnFilters.find((filter) => filter.id === "role")?.value ??
      "all"
  )
  const setRole = (value: string) =>
    tableState.setColumnFilters((current) => [
      ...current.filter((filter) => filter.id !== "role"),
      { id: "role", value }
    ])
  // The member endpoint cannot search names or emails across server pages.
  const paged = pageSize !== undefined && !search.trim()
  const allMembers = useAllOrganizationMembers(id, { enabled: !paged })
  const pagedMembers = useListOrganizationMembers(client, {
    enabled: paged && tableState.ready && !!id,
    placeholderData: keepPreviousData,
    query: {
      organizationId: id,
      limit: tableState.pagination.pageSize,
      offset: tableState.pagination.pageIndex * tableState.pagination.pageSize,
      ...(role !== "all"
        ? {
            filterField: "role",
            filterValue: role,
            filterOperator: "contains" as const
          }
        : {}),
      ...(tableState.sorting[0]?.id === "role"
        ? {
            sortBy: "role",
            sortDirection: tableState.sorting[0].desc
              ? ("desc" as const)
              : ("asc" as const)
          }
        : {})
    }
  })
  const members = paged ? pagedMembers : allMembers
  const ownerMembers = useAllOrganizationMembers(id, { role: creatorRole })
  const activeRole = useActiveMemberRole(client, {
    query: { organizationId: id },
    enabled: !!id
  })
  const [inviteOpen, setInviteOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkPending, setBulkPending] = useState(false)
  const [error, setError] = useState("")
  const filtered = (members.data?.members ?? []).filter(
    (member) =>
      (role === "all" || hasMemberRole(member.role, role)) &&
      `${member.user.name} ${member.user.email}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  )
  const list = useNativeList(
    filtered,
    {
      user: common.auth.name,
      role: localization.role,
      ...Object.fromEntries(
        modelFields.member.map((field) => [
          field.name,
          field.label ?? field.name
        ])
      )
    },
    {
      name: (a, b) => a.user.name.localeCompare(b.user.name),
      email: (a, b) => a.user.email.localeCompare(b.user.email),
      role: (a, b) =>
        memberRoleLabels(a.role, roles)
          .join()
          .localeCompare(memberRoleLabels(b.role, roles).join())
    },
    tableState,
    {
      isPending: members.isPending || members.isPlaceholderData,
      accessors: {
        name: (member) => member.user.name,
        email: (member) => member.user.email
      },
      manualPagination: paged,
      rowCount: members.data?.total
    }
  )
  const isOwner = hasMemberRole(activeRole.data?.role, creatorRole)
  const eligible = list.selected.filter((memberId) => {
    const member = members.data?.members.find((item) => item.id === memberId)
    return member && member.userId !== session.data?.user.id
  })
  const bulkRemove = async () => {
    if (bulkPending || !removePermission.data?.success || !id) return
    setBulkPending(true)
    setError("")
    try {
      const fresh = await ownerMembers.refetch()
      if (fresh.error) throw fresh.error
      const owners =
        fresh.data?.members.filter((member) =>
          hasMemberRole(member.role, creatorRole)
        ) ?? []
      if (
        owners.length &&
        owners.every((member) => eligible.includes(member.id))
      )
        throw new Error(localization.onlyOwnerActionDisabled)
      for (const memberId of eligible) {
        await remove.mutateAsync({
          organizationId: id,
          memberIdOrEmail: memberId
        })
        list.setSelected((current) =>
          current.filter((value) => value !== memberId)
        )
      }
      setBulkOpen(false)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBulkPending(false)
    }
  }
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.members}</Txt>
      <Button
        isDisabled={!invite.data?.success}
        onPress={() => setInviteOpen(true)}
      >
        {localization.inviteMember}
      </Button>
      <SearchField
        value={search}
        onChangeText={(value) => {
          setSearch(value)
          list.setPage(0)
        }}
        placeholder={localization.search}
      />
      <Select
        label={localization.role}
        selectedKey={role}
        onSelectionChange={(value) => {
          setRole(value)
          list.setPage(0)
        }}
        options={[
          { key: "all", label: localization.all },
          ...Object.entries(roles).map(([key, label]) => ({ key, label }))
        ]}
      />
      <NativeListTools
        list={list}
        sortLabels={{
          name: common.auth.name,
          email: common.auth.email,
          role: localization.role
        }}
        selection={!!removePermission.data?.success}
      >
        {!!eligible.length && removePermission.data?.success ? (
          <Button variant="danger" onPress={() => setBulkOpen(true)}>
            {localization.removeSelectedMembers}
          </Button>
        ) : null}
      </NativeListTools>
      <Card variant={props.variant}>
        <Card.Content className="gap-4">
          {organization.isPending || members.isPending ? (
            <OrganizationMemberRowSkeleton />
          ) : null}
          {members.error ? (
            <Txt accessibilityRole="alert">{members.error.message}</Txt>
          ) : null}
          {!members.isPending && !members.error && !filtered.length ? (
            <Txt>{`0 ${localization.members}`}</Txt>
          ) : null}
          {organization.data
            ? list.rows.map((member) => (
                <Box key={member.id} className="gap-2">
                  {removePermission.data?.success ? (
                    <Checkbox
                      isDisabled={
                        bulkPending || member.userId === session.data?.user.id
                      }
                      isSelected={list.selected.includes(member.id)}
                      onChange={(checked) =>
                        list.setSelected((current) =>
                          checked
                            ? [...current, member.id]
                            : current.filter((id) => id !== member.id)
                        )
                      }
                    >
                      {localization.selectRow}
                    </Checkbox>
                  ) : null}
                  <OrganizationMemberRow
                    member={member}
                    organization={organization.data!}
                    isOwner={isOwner}
                    visibleFields={list.visible}
                  />
                </Box>
              ))
            : null}
        </Card.Content>
      </Card>
      <NativeListPagination
        page={list.page}
        lastPage={list.lastPage}
        onPage={list.setPage}
      />
      <InviteMemberDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />
      <AlertDialog
        isOpen={bulkOpen}
        onOpenChange={(open) => {
          if (!bulkPending) setBulkOpen(open)
        }}
      >
        <AlertDialog.CloseTrigger />
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.removeSelectedMembers}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Txt>{localization.removeSelectedMembersDescription}</Txt>
          {error ? <Txt accessibilityRole="alert">{error}</Txt> : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button isDisabled={bulkPending} onPress={() => setBulkOpen(false)}>
            {common.settings.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={bulkPending}
            onPress={() => {
              void bulkRemove()
            }}
          >
            {localization.removeSelectedMembers}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}
