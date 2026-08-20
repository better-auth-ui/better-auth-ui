import { formatAdditionalFieldValue } from "@better-auth-ui/core"
import {
  memberRoleLabels,
  mergeOrganizationRoleLabels,
  type OrganizationAuthClient,
  parseMemberRoles
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useHasPermission,
  useListRoles,
  useUpdateMemberRole
} from "@better-auth-ui/react/plugins/organization"
import { ArrowRightFromSquare, Pencil, TrashBin } from "@gravity-ui/icons"
import { Button, Dropdown, Label, Spinner, Table, toast } from "@heroui/react"
import type { Member, Organization, User } from "better-auth/client"
import { useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { UserView } from "../user/user-view"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import { OrganizationMemberRowSkeleton } from "./organization-member-row-skeleton"
import { RemoveMemberDialog } from "./remove-member-dialog"

export type OrganizationMemberRowProps = {
  member: Member & { user: Partial<User> }
  isOwner?: boolean
  organization: Organization
}

export function OrganizationMemberRow({
  member,
  isOwner,
  organization
}: OrganizationMemberRowProps) {
  const { authClient } = useAuth()
  const {
    modelFields: { member: memberFields },
    dynamicAccessControl,
    localization: organizationLocalization,
    roles
  } = useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)
  const dynamicRoles = useListRoles(authClient as OrganizationAuthClient, {
    query: { organizationId: organization.id },
    enabled: dynamicAccessControl?.enabled === true
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

  const isPending = updatePermissionPending || deletePermissionPending

  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateMemberRole(authClient as OrganizationAuthClient, {
      onSuccess: () => toast.success(organizationLocalization.memberRoleUpdated)
    })

  // Better Auth persists multiple roles as one comma-joined string.
  const memberRoles = parseMemberRoles(member.role)
  const mergedRoles = mergeOrganizationRoleLabels(roles, dynamicRoles.data)
  const roleLabel = memberRoleLabels(member.role, mergedRoles).join(", ")

  const assignableRoles = Object.entries(mergedRoles).filter(
    ([key]) => isOwner || key !== "owner"
  )

  const isCurrentUser = session?.user.id === member.userId

  const [removeOpen, setRemoveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  if (isPending) {
    return <OrganizationMemberRowSkeleton />
  }

  return (
    <Table.Row>
      <Table.Cell>
        <div className="flex flex-col gap-1">
          <UserView user={member.user} />
          {memberFields.map((field) => {
            const value = formatAdditionalFieldValue(
              (member as unknown as Record<string, unknown>)[field.name]
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

      <Table.Cell>
        <div className="flex items-center justify-end gap-1">
          {hasUpdatePermission?.success && (
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
                      isDisabled={isUpdatingRole}
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
            <Button
              isIconOnly
              size="sm"
              variant="danger-soft"
              aria-label={organizationLocalization.leaveOrganization}
              onPress={() => setLeaveOpen(true)}
            >
              <ArrowRightFromSquare />
            </Button>
          ) : (
            hasDeletePermission?.success && (
              <Button
                isIconOnly
                size="sm"
                variant="danger-soft"
                aria-label={organizationLocalization.removeMember}
                onPress={() => setRemoveOpen(true)}
              >
                <TrashBin />
              </Button>
            )
          )}
        </div>

        {isCurrentUser && organization ? (
          <LeaveOrganizationDialog
            isOpen={leaveOpen}
            onOpenChange={setLeaveOpen}
            organization={organization}
          />
        ) : (
          hasDeletePermission?.success && (
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
