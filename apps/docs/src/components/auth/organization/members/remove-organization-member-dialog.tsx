"use client"

import { useAuth, useRemoveMember } from "@better-auth-ui/react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"

export type RemoveMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: {
    id: string
    user: { name: string; email: string }
  }
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member
}: RemoveMemberDialogProps) {
  const { authClient } = useAuth()

  const { mutate: removeMember, isPending } = useRemoveMember(authClient, {
    onSuccess: () => {
      toast.success(`Removed ${member.user.name} from the organization`)
      onOpenChange(false)
    },
    onError: (err) => {
      toast.error(`Failed to remove member. ${err.error.message}`)
    }
  })

  function handleOpenChange(next: boolean) {
    if (isPending) return
    onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>

          <AlertDialogDescription>
            This will remove{" "}
            <span className="font-medium text-foreground">
              {member.user.name}
            </span>{" "}
            ({member.user.email}) from the organization. They'll lose access to
            its members and resources. You can invite them back later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault()
              removeMember({ memberIdOrEmail: member.id })
            }}
          >
            {isPending && <Spinner />}
            Remove member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
