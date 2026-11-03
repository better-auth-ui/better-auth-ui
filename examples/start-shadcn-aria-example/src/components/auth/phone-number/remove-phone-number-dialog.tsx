"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
export type RemovePhoneNumberDialogProps = {
  description: string
  isPending: boolean
  label: string
  title: string
  cancelLabel: string
  onConfirm: () => void
}
/** Confirm removal because it can disable a sign-in and recovery method. */
export function RemovePhoneNumberDialog({
  cancelLabel,
  description,
  isPending,
  label,
  onConfirm,
  title
}: RemovePhoneNumberDialogProps) {
  return (
    <AlertDialogTrigger>
      <Button type="button" size="sm" variant="outline" isDisabled={isPending}>
        {label}
      </Button>
      <AlertDialog>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            isDisabled={isPending}
            onPress={onConfirm}
          >
            {isPending && <Spinner />}
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  )
}
