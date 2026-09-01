"use client"

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
import type { Member, Organization, User } from "better-auth/client"
import { LogOut, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { UserView } from "../user/user-view"
import { EditMemberRolesDialog } from "./edit-member-roles-dialog"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import { OrganizationTableSelectRow } from "./organization-table-selection"
import { RemoveMemberDialog } from "./remove-member-dialog"

export type OrganizationMemberRowProps = {
  member: Member & { user: Partial<User> }
  isOwner?: boolean
  ownerCount?: number
  organization: Organization
  selectableRow?: Parameters<typeof OrganizationTableSelectRow>[0]["row"]
  showRole?: boolean
  showTeams?: boolean
}

export function OrganizationMemberRow({
  member,
  isOwner,
  ownerCount,
  organization,
  selectableRow,
  showRole = true,
  showTeams
}: OrganizationMemberRowProps) {
  const { authClient } = useAuth<OrganizationAuthClient>()
  const {
    modelFields: { member: memberFields },
    dynamicAccessControl,
    creatorRole,
    localization: organizationLocalization,
    roles
  } = useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)
  const canReadRoles = useHasPermission(authClient, {
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
      enabled: showTeams === true
    }
  )

  const { data: hasUpdatePermission, isPending: updatePermissionPending } =
    useHasPermission(authClient, {
      organizationId: organization.id,
      permissions: { member: ["update"] }
    })

  const { data: hasDeletePermission, isPending: deletePermissionPending } =
    useHasPermission(authClient, {
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

  return (
    <TableRow
      data-state={selectableRow?.getIsSelected() ? "selected" : undefined}
    >
      {selectableRow && (
        <TableCell>
          <OrganizationTableSelectRow
            localization={organizationLocalization}
            row={selectableRow}
          />
        </TableCell>
      )}

      <TableCell>
        <div className="flex flex-col gap-1">
          <UserView user={member.user} />
          {memberFields.map((field) => {
            const value = formatAdditionalFieldValue(
              (member as unknown as Record<string, unknown>)[field.name]
            )
            return value ? (
              <span className="text-xs text-muted-foreground" key={field.name}>
                {field.label}: {value}
              </span>
            ) : null
          })}
        </div>
      </TableCell>

      {showRole && <TableCell>{roleLabel}</TableCell>}

      {showTeams && (
        <TableCell className="text-sm">
          {memberTeams.isPending ? (
            <Skeleton className="h-4 w-24 rounded-md" />
          ) : memberTeams.isError ? null : teamNames ? (
            teamNames
          ) : (
            <span className="text-muted-foreground">
              {organizationLocalization.noTeams}
            </span>
          )}
        </TableCell>
      )}

      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {canManageTarget && updatePermissionPending && (
            <Button
              aria-label={organizationLocalization.changeMemberRole}
              className="size-8"
              disabled
              size="icon"
              variant="ghost"
            >
              <Pencil />
            </Button>
          )}
          {canManageTarget && hasUpdatePermission?.success && (
            <Button
              className="size-8"
              onClick={() => setRoleEditorOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Pencil />
              <span className="sr-only">
                {organizationLocalization.changeMemberRole}
              </span>
            </Button>
          )}

          {canManageTarget && hasUpdatePermission?.success && (
            <EditMemberRolesDialog
              member={member}
              onOpenChange={setRoleEditorOpen}
              open={roleEditorOpen}
              organizationId={organization.id}
              protectedRole={creatorRole}
              protectedRoleRemovalDisabled={onlyOwnerActionDisabled}
              roles={assignableRoles}
            />
          )}

          {isCurrentUser ? (
            <Button
              size="icon"
              variant="outline"
              className="size-8 text-destructive"
              aria-label={organizationLocalization.leaveOrganization}
              disabled={onlyOwnerActionDisabled}
              title={
                onlyOwnerActionDisabled
                  ? organizationLocalization.onlyOwnerActionDisabled
                  : undefined
              }
              onClick={() => setLeaveOpen(true)}
            >
              <LogOut />
            </Button>
          ) : canManageTarget && deletePermissionPending ? (
            <Button
              aria-label={organizationLocalization.removeMember}
              className="size-8 text-destructive"
              disabled
              size="icon"
              variant="outline"
            >
              <Trash2 />
            </Button>
          ) : canManageTarget && hasDeletePermission?.success ? (
            <Button
              size="icon"
              variant="outline"
              className="size-8 text-destructive"
              aria-label={organizationLocalization.removeMember}
              disabled={onlyOwnerActionDisabled}
              title={
                onlyOwnerActionDisabled
                  ? organizationLocalization.onlyOwnerActionDisabled
                  : undefined
              }
              onClick={() => setRemoveOpen(true)}
            >
              <Trash2 />
            </Button>
          ) : null}
        </div>

        {isCurrentUser && organization && !onlyOwnerActionDisabled ? (
          <LeaveOrganizationDialog
            open={leaveOpen}
            onOpenChange={setLeaveOpen}
            organization={organization}
          />
        ) : (
          canManageTarget &&
          hasDeletePermission?.success &&
          !onlyOwnerActionDisabled && (
            <RemoveMemberDialog
              open={removeOpen}
              onOpenChange={setRemoveOpen}
              member={member}
            />
          )
        )}
      </TableCell>
    </TableRow>
  )
}
