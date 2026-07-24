"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useHasPermission,
  useSession,
  useUpdateMemberRole
} from "@better-auth-ui/react"
import type { Member, Organization, User } from "better-auth/client"
import { LogOut, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
                {assignableRoles.map(([role, label]) => (
                  <DropdownMenuItem
                    key={role}
                    disabled={member.role === role}
                    onClick={() =>
                      updateMemberRole({ memberId: member.id, role })
                    }
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
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
