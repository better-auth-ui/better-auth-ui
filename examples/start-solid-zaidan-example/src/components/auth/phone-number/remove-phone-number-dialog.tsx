import { Show } from "solid-js"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export type RemovePhoneNumberDialogProps = {
  cancelLabel: string
  description: string
  isPending: boolean
  label: string
  title: string
  onConfirm: () => void
}

/** Confirm removal because it can disable a sign-in and recovery method. */
export function RemovePhoneNumberDialog(props: RemovePhoneNumberDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        as={Button}
        disabled={props.isPending}
        size="sm"
        variant="outline"
      >
        {props.label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={props.isPending}>
            {props.cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={props.isPending}
            variant="destructive"
            onClick={props.onConfirm}
          >
            <Show when={props.isPending}>
              <Spinner />
            </Show>
            {props.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
