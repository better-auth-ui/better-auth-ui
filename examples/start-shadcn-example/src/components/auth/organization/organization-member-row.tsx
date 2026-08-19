"use client"

import {
  memberRoleLabels,
  type OrganizationAuthClient,
  parseMemberRoles
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useHasPermission,
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
import { Spinner } from "@/components/ui/spinner"
import { TableCell, TableRow } from "@/components/ui/table"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
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
  const { authClient } = useAuth<OrganizationAuthClient>()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { data: session } = useSession(authClient)

  const { data: hasUpdatePermission, isPending: updatePermissionPending } =
    useHasPermission(authClient, {
      permissions: { member: ["update"] }
    })

  const { data: hasDeletePermission, isPending: deletePermissionPending } =
    useHasPermission(authClient, {
      permissions: { member: ["delete"] }
    })

  const isPending = updatePermissionPending || deletePermissionPending

  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateMemberRole(authClient, {
      onSuccess: () => toast.success(organizationLocalization.memberRoleUpdated)
    })

  // Better Auth persists multiple roles as one comma-joined string.
  const memberRoles = parseMemberRoles(member.role)
  const roleLabel = memberRoleLabels(member.role, roles).join(", ")

  const assignableRoles = Object.entries(roles).filter(
    ([key]) => isOwner || key !== "owner"
  )

  const toggleRole = (role: string) => {
    const next = memberRoles.includes(role)
      ? memberRoles.filter((entry) => entry !== role)
      : [...memberRoles, role]

    // A member always holds at least one role, so refuse to clear the last one.
    if (next.length === 0) return

    updateMemberRole({ memberId: member.id, role: next })
  }

  const isCurrentUser = session?.user.id === member.userId

  const [removeOpen, setRemoveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  if (isPending) {
    return <OrganizationMemberRowSkeleton />
  }

  return (
    <TableRow>
      <TableCell>
        <UserView user={member.user} />
      </TableCell>

      <TableCell>{roleLabel}</TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {hasUpdatePermission?.success && (
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
                      disabled={checked && memberRoles.length === 1}
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
              onClick={() => setLeaveOpen(true)}
            >
              <LogOut />
            </Button>
          ) : (
            hasDeletePermission?.success && (
              <Button
                size="icon"
                variant="outline"
                className="size-8 text-destructive"
                aria-label={organizationLocalization.removeMember}
                onClick={() => setRemoveOpen(true)}
              >
                <Trash2 />
              </Button>
            )
          )}
        </div>

        {isCurrentUser && organization ? (
          <LeaveOrganizationDialog
            open={leaveOpen}
            onOpenChange={setLeaveOpen}
            organization={organization}
          />
        ) : (
          hasDeletePermission?.success && (
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
