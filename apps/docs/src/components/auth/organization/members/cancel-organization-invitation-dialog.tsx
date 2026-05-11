"use client"

import { useAuth, useCancelInvitation } from "@better-auth-ui/react"
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

export type CancelInvitationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitation: {
    id: string
    email: string
  }
}

export function CancelInvitationDialog({
  open,
  onOpenChange,
  invitation
}: CancelInvitationDialogProps) {
  const { authClient } = useAuth()

  const { mutate: cancelInvitation, isPending } = useCancelInvitation(
    authClient,
    {
      onSuccess: () => {
        toast.success(`Canceled invitation to ${invitation.email}`)
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(`Failed to cancel invitation. ${err.error.message}`)
      }
    }
  )

  function handleOpenChange(next: boolean) {
    if (isPending) return
    onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel invitation?</AlertDialogTitle>

          <AlertDialogDescription>
            This will revoke the pending invitation for{" "}
            <span className="font-medium text-foreground">
              {invitation.email}
            </span>
            . They won't be able to use the existing invitation link. You can
            send a new one later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Keep invitation
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault()
              cancelInvitation({ invitationId: invitation.id })
            }}
          >
            {isPending && <Spinner />}
            Cancel invitation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
