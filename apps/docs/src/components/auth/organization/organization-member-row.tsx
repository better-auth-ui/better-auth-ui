"use client"

import { formatAdditionalFieldValue } from "@better-auth-ui/core"
import {
  hasMemberRole,
  memberRoleLabels,
  mergeOrganizationRoleLabels,
  type OrganizationAuthClient,
  parseMemberRoles
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useHasPermission,
  useListRoles,
  useListUserTeams,
  useUpdateMemberRole
} from "@better-auth-ui/react/plugins/organization"
import type { Member, Organization, User } from "better-auth/client"
import { LogOut, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { TableCell, TableRow } from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { UserView } from "../user/user-view"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import { RemoveMemberDialog } from "./remove-member-dialog"

export type OrganizationMemberRowProps = {
  member: Member & { user: Partial<User> }
  isOwner?: boolean
  ownerCount?: number
  organization: Organization
  showTeams?: boolean
}

export function OrganizationMemberRow({
  member,
  isOwner,
  ownerCount,
  organization,
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
  const dynamicRoles = useListRoles(authClient, {
    query: { organizationId: organization.id },
    enabled:
      dynamicAccessControl?.enabled === true &&
      canReadRoles.data?.success === true
  })
  const memberTeams = useListUserTeams(authClient, {
    query: {
      organizationId: organization.id,
      userId: member.userId
    },
    enabled: showTeams === true
  })

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

  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateMemberRole(authClient, {
      onSuccess: () => toast.success(organizationLocalization.memberRoleUpdated)
    })

  // Better Auth persists multiple roles as one comma-joined string.
  const memberRoles = parseMemberRoles(member.role)
  const mergedRoles = mergeOrganizationRoleLabels(roles, dynamicRoles.data)
  const roleLabel = memberRoleLabels(member.role, mergedRoles).join(", ")
  const teamNames = memberTeams.data?.map((team) => team.name).join(", ")

  const assignableRoles = Object.entries(mergedRoles).filter(
    ([key]) => isOwner || key !== creatorRole
  )

  const toggleRole = (role: string) => {
    const next = memberRoles.includes(role)
      ? memberRoles.filter((entry) => entry !== role)
      : [...memberRoles, role]

    // A member always holds at least one role, so refuse to clear the last one.
    if (next.length === 0) return

    updateMemberRole({
      memberId: member.id,
      organizationId: organization.id,
      role: next
    })
  }

  const isCurrentUser = session?.user.id === member.userId
  const targetIsOwner = hasMemberRole(member.role, creatorRole)
  const canManageTarget = isOwner || !targetIsOwner
  const onlyOwnerActionDisabled =
    targetIsOwner && (ownerCount === undefined || ownerCount <= 1)

  const [removeOpen, setRemoveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  return (
    <TableRow>
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

      <TableCell>{roleLabel}</TableCell>

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
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ size: "icon", variant: "ghost" }),
                  "size-8"
                )}
                disabled={isUpdatingRole}
                aria-label={organizationLocalization.changeMemberRole}
              >
                {isUpdatingRole ? <Spinner /> : <Pencil />}
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {assignableRoles.map(([role, label]) => {
                  const checked = memberRoles.includes(role)

                  return (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={checked}
                      disabled={
                        isUpdatingRole ||
                        (checked && memberRoles.length === 1) ||
                        (role === creatorRole &&
                          checked &&
                          onlyOwnerActionDisabled)
                      }
                      onSelect={(event) => {
                        // Keep the menu open so several roles can be toggled.
                        event.preventDefault()
                        toggleRole(role)
                      }}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
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
