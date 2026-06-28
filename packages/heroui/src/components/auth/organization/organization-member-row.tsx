import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useHasPermission,
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
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)

  const { data: hasUpdatePermission, isPending: updatePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      permissions: { member: ["update"] }
    })

  const { data: hasDeletePermission, isPending: deletePermissionPending } =
    useHasPermission(authClient as OrganizationAuthClient, {
      permissions: { member: ["delete"] }
    })

  const isPending = updatePermissionPending || deletePermissionPending

  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateMemberRole(authClient as OrganizationAuthClient, {
      onSuccess: () => toast.success(organizationLocalization.memberRoleUpdated)
    })

  const roleLabel = roles?.[member.role] ?? member.role

  const assignableRoles = Object.entries(roles).filter(
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
        <UserView user={member.user} />
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
                <Dropdown.Menu>
                  {assignableRoles.map(([role, label]) => (
                    <Dropdown.Item
                      key={role}
                      textValue={label}
                      isDisabled={member.role === role}
                      onAction={() =>
                        updateMemberRole({ memberId: member.id, role })
                      }
                    >
                      <Label>{label}</Label>
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
