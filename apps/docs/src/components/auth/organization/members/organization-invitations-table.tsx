"use client"

import {
  useAuth,
  useOrganizationInvitations,
  useOrganizationPermissions,
  useResendInvitation
} from "@better-auth-ui/react"
import type { BetterFetchError } from "better-auth/react"
import {
  AlertCircle,
  MailX,
  MoreHorizontal,
  Search,
  Send,
  UserPlus
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { CancelInvitationDialog } from "@/components/auth/organization/members/cancel-organization-invitation-dialog"
import { InviteMembersSheet } from "@/components/auth/organization/members/invite-organization-members-sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { type BaseOrganizationRoles, cn } from "@/lib/utils"

const COLUMN_COUNT = 6
const SKELETON_ROWS = 4

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
})

const STATUS_STYLES: Record<string, string> = {
  pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  accepted:
    "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
  rejected: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  canceled: "border-muted-foreground/20 bg-muted text-muted-foreground"
}

const STATUS_PRIORITY: Record<string, number> = {
  pending: 0,
  accepted: 1,
  rejected: 2,
  canceled: 3
}

function getInitial(email: string) {
  return email.slice(0, 2).toUpperCase()
}

export type OrganizationInvitationsProps = {
  className?: string
}

export function OrganizationInvitations({
  className
}: OrganizationInvitationsProps) {
  const { authClient } = useAuth()
  const {
    data: invitations,
    isPending,
    error
  } = useOrganizationInvitations(authClient)
  const { permissions } = useOrganizationPermissions(authClient)

  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [cancelingInvitation, setCancelingInvitation] = useState<
    NonNullable<typeof invitations>[number] | null
  >(null)

  const {
    mutate: resendInvitation,
    isPending: isResending,
    variables: resendingVars
  } = useResendInvitation(authClient, {
    onSuccess: (_, variables) => {
      toast.success(`Resent invitation to ${variables.email}`)
    },
    onError: (err) => {
      toast.error(`Failed to resend invitation. ${err.error.message}`)
    }
  })

  const filteredInvitations = useMemo(() => {
    if (!invitations) return []

    const query = search.trim().toLowerCase()
    const matched = query
      ? invitations.filter((invitation) =>
          invitation.email.toLowerCase().includes(query)
        )
      : invitations

    return [...matched].sort(
      (a, b) =>
        (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
    )
  }, [invitations, search])

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <div className="relative w-3/5">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="search"
            placeholder="Search invitations..."
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
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[160px]">Invited</TableHead>
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
                  <InvitationSkeletonRow key={`skeleton-${i}`} />
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
                        <span>Failed to load invitations.</span>
                        <span className="text-xs">
                          {(error as BetterFetchError).error.message}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }

              if (filteredInvitations.length === 0) {
                return (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMN_COUNT}
                      className="h-24 text-center text-muted-foreground text-sm"
                    >
                      No invitations found.
                    </TableCell>
                  </TableRow>
                )
              }

              return filteredInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="pl-4">
                    <Avatar className="size-9">
                      <AvatarFallback>
                        {getInitial(invitation.email)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium">{invitation.email}</span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        STATUS_STYLES[invitation.status]
                      )}
                    >
                      {invitation.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(new Date(invitation.createdAt))}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{invitation.role}</Badge>
                  </TableCell>

                  <TableCell className="pr-4 text-right">
                    {invitation.status === "pending" &&
                      (permissions.invitation.create ||
                        permissions.invitation.cancel) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Open actions for ${invitation.email}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            {permissions.invitation.create && (
                              <DropdownMenuItem
                                disabled={
                                  isResending &&
                                  resendingVars?.email === invitation.email
                                }
                                onSelect={() =>
                                  resendInvitation({
                                    email: invitation.email,
                                    role: invitation.role as BaseOrganizationRoles
                                  })
                                }
                              >
                                <Send />
                                Resend invitation
                              </DropdownMenuItem>
                            )}

                            {permissions.invitation.create &&
                              permissions.invitation.cancel && (
                                <DropdownMenuSeparator />
                              )}

                            {permissions.invitation.cancel && (
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() =>
                                  setCancelingInvitation(invitation)
                                }
                              >
                                <MailX />
                                Cancel invitation
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

      {cancelingInvitation && (
        <CancelInvitationDialog
          open={!!cancelingInvitation}
          onOpenChange={(next) => {
            if (!next) setCancelingInvitation(null)
          }}
          invitation={cancelingInvitation}
        />
      )}
    </div>
  )
}

function InvitationSkeletonRow() {
  return (
    <TableRow>
      <TableCell className="pl-4">
        <Skeleton className="size-9 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-md" />
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
