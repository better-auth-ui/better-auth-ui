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
import { ArrowRightFromSquare, Pencil, TrashBin } from "@gravity-ui/icons"
import {
  Button,
  Dropdown,
  Label,
  Skeleton,
  Spinner,
  Table,
  toast
} from "@heroui/react"
import type { Member, Organization, User } from "better-auth/client"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
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
  const dynamicRoles = useListRoles(authClient as OrganizationAuthClient, {
    query: { organizationId: organization.id },
    enabled:
      dynamicAccessControl?.enabled === true &&
      canReadRoles.data?.success === true
  })
  const memberTeams = useListUserTeams(authClient as OrganizationAuthClient, {
    query: {
      organizationId: organization.id,
      userId: member.userId
    },
    enabled: showTeams === true
  })

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

  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateMemberRole(authClient as OrganizationAuthClient, {
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

  const isCurrentUser = session?.user.id === member.userId
  const targetIsOwner = hasMemberRole(member.role, creatorRole)
  const canManageTarget = isOwner || !targetIsOwner
  const onlyOwnerActionDisabled =
    targetIsOwner && (ownerCount === undefined || ownerCount <= 1)

  const [removeOpen, setRemoveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  return (
    <Table.Row>
      <Table.Cell>
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

      <Table.Cell>{roleLabel}</Table.Cell>

      {showTeams && (
        <Table.Cell>
          {memberTeams.isPending ? (
            <Skeleton className="h-4 w-24 rounded-lg" />
          ) : memberTeams.isError ? null : teamNames ? (
            teamNames
          ) : (
            <span className="text-muted">
              {organizationLocalization.noTeams}
            </span>
          )}
        </Table.Cell>
      )}

      <Table.Cell>
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
            <Dropdown>
              <Button
                isIconOnly
                size="sm"
                variant="tertiary"
                isDisabled={isUpdatingRole}
                aria-label={organizationLocalization.changeMemberRole}
              >
                {isUpdatingRole ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <Pencil />
                )}
              </Button>

              <Dropdown.Popover className="min-w-fit">
                <Dropdown.Menu
                  selectionMode="multiple"
                  selectedKeys={new Set(memberRoles)}
                  onSelectionChange={(keys) => {
                    const next = [...keys] as string[]

                    // A member always holds at least one role, so refuse to
                    // clear the last one.
                    if (next.length === 0) return

                    updateMemberRole({
                      memberId: member.id,
                      organizationId: organization.id,
                      role: next
                    })
                  }}
                >
                  {assignableRoles.map(([role, label]) => (
                    <Dropdown.Item
                      key={role}
                      id={role}
                      isDisabled={
                        isUpdatingRole ||
                        (role === creatorRole &&
                          memberRoles.includes(role) &&
                          onlyOwnerActionDisabled)
                      }
                      textValue={label}
                    >
                      <Label>{label}</Label>

                      <Dropdown.ItemIndicator />
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
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
    </Table.Row>
  )
}
