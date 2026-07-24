"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useRemoveMember
} from "@better-auth-ui/react"
import type { Member, User } from "better-auth/client"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { UserView } from "../user/user-view"

export type RemoveMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member & { user: Partial<User> }
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member
}: RemoveMemberDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const { mutate: removeMember, isPending } = useRemoveMember(
    authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.memberRemoved)
      }
    }
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>

          <AlertDialogTitle>
            {organizationLocalization.removeMember}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {organizationLocalization.removeMemberWarning}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Card>
          <CardContent className="flex flex-row items-center justify-between gap-2">
            <UserView user={member.user} />

            <Badge variant="outline">
              {roles?.[member.role] ?? member.role}
            </Badge>
          </CardContent>
        </Card>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {localization.settings.cancel}
          </AlertDialogCancel>

          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              removeMember({
                memberIdOrEmail: member.id,
                organizationId: member.organizationId
              })
            }
          >
            {isPending && <Spinner />}

            {organizationLocalization.removeMember}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
