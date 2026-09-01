import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Trash2 } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function OrganizationTableBulkAction(props: {
  cancelLabel: string
  confirmLabel: string
  description: string
  disabled?: boolean
  localization: Pick<OrganizationLocalization, "selectedCount">
  onConfirm: () => Promise<void>
  pending: boolean
  selectedCount: number
  title: string
}) {
  const [open, setOpen] = createSignal(false)
  return (
    <Show when={props.selectedCount > 0}>
      <AlertDialog
        open={open()}
        onOpenChange={(next) => !props.pending && setOpen(next)}
      >
        <AlertDialogTrigger
          as={Button}
          disabled={props.disabled}
          size="sm"
          variant="destructive"
        >
          <Trash2 />
          {props.confirmLabel} ({props.selectedCount})
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>{props.title}</AlertDialogTitle>
            <AlertDialogDescription>{props.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <p class="text-sm font-medium">
            {props.localization.selectedCount.replace(
              "{{count}}",
              String(props.selectedCount)
            )}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={props.pending}>
              {props.cancelLabel}
            </AlertDialogCancel>
            <Button
              disabled={props.pending}
              onClick={async () => {
                await props.onConfirm()
                setOpen(false)
              }}
              variant="destructive"
            >
              {props.confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Show>
  )
}
