import type { ReactNode } from "react"
import { formatAdditionalFieldValue } from "@better-auth-ui/core"
import {
  hasMemberRole,
  memberRoleLabels,
  mergeOrganizationRoleLabels,
  type OrganizationAuthClient,
  type OrganizationRolesAuthClient,
  type OrganizationTeamsAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useHasPermission,
  useListRoles,
  useListUserTeams
} from "@better-auth-ui/react/plugins/organization"
import { ArrowRightFromSquare, Pencil, TrashBin } from "@gravity-ui/icons"
import { Button, Skeleton, Table } from "@heroui/react"
import type { Member, Organization, User } from "better-auth/client"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { UserView } from "../user/user-view"
import { EditMemberRolesDialog } from "./edit-member-roles-dialog"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import {
  type OrganizationSelectableRow,
  OrganizationTableSelectRow
} from "./organization-table-selection"
import { RemoveMemberDialog } from "./remove-member-dialog"

export type OrganizationMemberRowProps = {
  columnIds: readonly string[]
  member: Member & { user: Partial<User> }
  isOwner?: boolean
  ownerCount?: number
  organization: Organization
  selectableRow?: OrganizationSelectableRow<Member & { user: Partial<User> }>
}

export function OrganizationMemberRow({
  columnIds,
  member,
  isOwner,
  ownerCount,
  organization,
  selectableRow
}: OrganizationMemberRowProps) {
  const { authClient, locale } = useAuth()
  const {
    modelFields: { member: memberFields },
    creatorRole,
    dynamicAccessControl,
    localization: organizationLocalization,
    roles
  } = useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)
  const canReadRoles = useHasPermission(authClient as OrganizationAuthClient, {
    organizationId: organization.id,
    permissions: { ac: ["read"] }
  })
  const dynamicRoles = useListRoles(authClient as OrganizationRolesAuthClient, {
    query: { organizationId: organization.id },
    enabled:
      dynamicAccessControl?.enabled === true &&
      canReadRoles.data?.success === true
  })
  const memberTeams = useListUserTeams(
    authClient as OrganizationTeamsAuthClient,
    {
      query: {
        organizationId: organization.id,
        userId: member.userId
      },
      enabled: columnIds.includes("teams")
    }
  )

  const { data: hasUpdatePermission, isPending: updatePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      organizationId: organization.id,
      permissions: { member: ["update"] }
    })

  const { data: hasDeletePermission, isPending: deletePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      organizationId: organization.id,
      permissions: { member: ["delete"] }
    })

  const mergedRoles = mergeOrganizationRoleLabels(roles, dynamicRoles.data)
  const roleLabel = memberRoleLabels(member.role, mergedRoles).join(", ")
  const teamNames = memberTeams.data?.map((team) => team.name).join(", ")

  const assignableRoles = Object.entries(mergedRoles).filter(
    ([key]) => isOwner || key !== creatorRole
  )

  const isCurrentUser = session?.user.id === member.userId
  const targetIsOwner = hasMemberRole(member.role, creatorRole)
  const canManageTarget = isOwner || !targetIsOwner
  const onlyOwnerActionDisabled =
    targetIsOwner && (ownerCount === undefined || ownerCount <= 1)

  const [removeOpen, setRemoveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [roleEditorOpen, setRoleEditorOpen] = useState(false)

  const cells: Record<string, ReactNode> = {
    select: selectableRow && (
      <Table.Cell key="select">
        <OrganizationTableSelectRow
          localization={organizationLocalization}
          row={selectableRow}
        />
      </Table.Cell>
    ),
    user: (
      <Table.Cell key="user">
        <div className="flex flex-col gap-1">
          <UserView user={member.user} />
          {memberFields.map((field) => {
            const value = formatAdditionalFieldValue(
              (member as unknown as Record<string, unknown>)[field.name],
              locale.languageTag
            )
            return value ? (
              <span className="text-muted text-xs" key={field.name}>
                {field.label}: {value}
              </span>
            ) : null
          })}
        </div>
      </Table.Cell>
    ),
    role: <Table.Cell key="role">{roleLabel}</Table.Cell>,
    teams: (
      <Table.Cell key="teams">
        {memberTeams.isPending ? (
          <Skeleton className="h-4 w-24 rounded-lg" />
        ) : memberTeams.isError ? null : teamNames ? (
          teamNames
        ) : (
          <span className="text-muted">{organizationLocalization.noTeams}</span>
        )}
      </Table.Cell>
    ),
    actions: (
      <Table.Cell key="actions">
        <div className="flex items-center justify-end gap-1">
          {canManageTarget && updatePermissionPending && (
            <Button
              aria-label={organizationLocalization.changeMemberRole}
              isDisabled
              isIconOnly
              size="sm"
              variant="tertiary"
            >
              <Pencil />
            </Button>
          )}
          {canManageTarget && hasUpdatePermission?.success && (
            <Button
              aria-label={organizationLocalization.changeMemberRole}
              isIconOnly
              onPress={() => setRoleEditorOpen(true)}
              size="sm"
              variant="tertiary"
            >
              <Pencil />
            </Button>
          )}

          {canManageTarget && hasUpdatePermission?.success && (
            <EditMemberRolesDialog
              isOpen={roleEditorOpen}
              member={member}
              onOpenChange={setRoleEditorOpen}
              organizationId={organization.id}
              protectedRole={creatorRole}
              protectedRoleRemovalDisabled={onlyOwnerActionDisabled}
              roles={assignableRoles}
            />
          )}

          {isCurrentUser ? (
            <span
              title={
                onlyOwnerActionDisabled
                  ? organizationLocalization.onlyOwnerActionDisabled
                  : undefined
              }
            >
              <Button
                isIconOnly
                size="sm"
                variant="danger-soft"
                aria-label={organizationLocalization.leaveOrganization}
                isDisabled={onlyOwnerActionDisabled}
                onPress={() => setLeaveOpen(true)}
              >
                <ArrowRightFromSquare />
              </Button>
            </span>
          ) : canManageTarget && deletePermissionPending ? (
            <Button
              aria-label={organizationLocalization.removeMember}
              isDisabled
              isIconOnly
              size="sm"
              variant="danger-soft"
            >
              <TrashBin />
            </Button>
          ) : canManageTarget && hasDeletePermission?.success ? (
            <span
              title={
                onlyOwnerActionDisabled
                  ? organizationLocalization.onlyOwnerActionDisabled
                  : undefined
              }
            >
              <Button
                isIconOnly
                size="sm"
                variant="danger-soft"
                aria-label={organizationLocalization.removeMember}
                isDisabled={onlyOwnerActionDisabled}
                onPress={() => setRemoveOpen(true)}
              >
                <TrashBin />
              </Button>
            </span>
          ) : null}
        </div>

        {isCurrentUser && organization && !onlyOwnerActionDisabled ? (
          <LeaveOrganizationDialog
            isOpen={leaveOpen}
            onOpenChange={setLeaveOpen}
            organization={organization}
          />
        ) : (
          canManageTarget &&
          hasDeletePermission?.success &&
          !onlyOwnerActionDisabled && (
            <RemoveMemberDialog
              isOpen={removeOpen}
              onOpenChange={setRemoveOpen}
              member={member}
            />
          )
        )}
      </Table.Cell>
    )
  }

  return (
    <Table.Row id={member.id}>{columnIds.map((id) => cells[id])}</Table.Row>
  )
}
