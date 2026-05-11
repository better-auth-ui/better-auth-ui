"use client"

import {
  useAuth,
  useOrganizationMembers,
  useOrganizationPermissions
} from "@better-auth-ui/react"
import type { BetterFetchError } from "better-auth/react"
import {
  AlertCircle,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  UserPlus
} from "lucide-react"
import { useMemo, useState } from "react"
import { InviteMembersSheet } from "@/components/auth/organization/members/invite-organization-members-sheet"
import { RemoveMemberDialog } from "@/components/auth/organization/members/remove-organization-member-dialog"
import { UpdateMemberRoleDialog } from "@/components/auth/organization/members/update-organization-member-role-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 5
const SKELETON_ROWS = 4

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
})

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export type OrganizationMembersProps = {
  className?: string
}

export function OrganizationMembers({ className }: OrganizationMembersProps) {
  const { authClient } = useAuth()
  const { data: members, isPending, error } = useOrganizationMembers(authClient)
  const { permissions } = useOrganizationPermissions(authClient)

  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<
    NonNullable<typeof members>[number] | null
  >(null)
  const [removingMember, setRemovingMember] = useState<
    NonNullable<typeof members>[number] | null
  >(null)

  const filteredMembers = useMemo(() => {
    if (!members) return []

    const query = search.trim().toLowerCase()
    if (!query) return members

    return members.filter(
      (member) =>
        member.user.name.toLowerCase().includes(query) ||
        member.user.email.toLowerCase().includes(query)
    )
  }, [members, search])

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <div className="relative w-3/5">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="search"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            disabled={isPending || !!error}
          />
        </div>

        {permissions.invitation.create && (
          <Button
            size="sm"
            onClick={() => setInviteOpen(true)}
            className="ml-auto"
          >
            <UserPlus />
            Invite
          </Button>
        )}
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[68px] pl-4">
                <span className="sr-only">Photo</span>
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead className="w-[160px]">Joined</TableHead>
              <TableHead className="w-[120px]">Role</TableHead>
              <TableHead className="w-[60px] pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {(() => {
              if (isPending) {
                return Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <MemberSkeletonRow key={`skeleton-${i}`} />
                ))
              }

              if (error) {
                return (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMN_COUNT}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
                        <AlertCircle className="size-5 text-destructive" />
                        <span>Failed to load members.</span>
                        <span className="text-xs">
                          {(error as BetterFetchError).error.message}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }

              if (filteredMembers.length === 0) {
                return (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMN_COUNT}
                      className="h-24 text-center text-muted-foreground text-sm"
                    >
                      No members found.
                    </TableCell>
                  </TableRow>
                )
              }

              return filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="pl-4">
                    <Avatar className="size-9">
                      <AvatarImage
                        src={member.user.image ?? undefined}
                        alt={member.user.name}
                      />

                      <AvatarFallback>
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.user.name}</span>

                      <span className="text-muted-foreground text-xs">
                        {member.user.email}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(new Date(member.createdAt))}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>

                  <TableCell className="pr-4 text-right">
                    {(permissions.member.update ||
                      permissions.member.delete) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Open actions for ${member.user.name}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {permissions.member.update && (
                            <DropdownMenuItem
                              onSelect={() => setEditingMember(member)}
                            >
                              <Shield />
                              Change role
                            </DropdownMenuItem>
                          )}

                          {permissions.member.update &&
                            permissions.member.delete && (
                              <DropdownMenuSeparator />
                            )}

                          {permissions.member.delete && (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setRemovingMember(member)}
                            >
                              <Trash2 />
                              Remove member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            })()}
          </TableBody>
        </Table>
      </Card>

      <InviteMembersSheet open={inviteOpen} onOpenChange={setInviteOpen} />

      {editingMember && (
        <UpdateMemberRoleDialog
          open={!!editingMember}
          onOpenChange={(next) => {
            if (!next) setEditingMember(null)
          }}
          member={editingMember}
        />
      )}

      {removingMember && (
        <RemoveMemberDialog
          open={!!removingMember}
          onOpenChange={(next) => {
            if (!next) setRemovingMember(null)
          }}
          member={removingMember}
        />
      )}
    </div>
  )
}

function MemberSkeletonRow() {
  return (
    <TableRow>
      <TableCell className="pl-4">
        <Skeleton className="size-9 rounded-full" />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-md" />
      </TableCell>
      <TableCell className="pr-4 text-right">
        <Skeleton className="ml-auto size-8" />
      </TableCell>
    </TableRow>
  )
}
