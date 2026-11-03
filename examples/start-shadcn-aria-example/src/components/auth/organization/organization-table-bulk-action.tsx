"use client"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
export function OrganizationTableBulkAction({
  actionLabel,
  cancelLabel,
  count,
  description,
  disabled,
  isPending,
  onConfirm,
  selectedLabel
}: {
  actionLabel: string
  cancelLabel: string
  count: number
  description: string
  disabled?: boolean
  isPending: boolean
  onConfirm: () => Promise<void>
  selectedLabel: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm tabular-nums">
        {selectedLabel.replace("{{count}}", String(count))}
      </span>
      <AlertDialogTrigger
        isOpen={open}
        onOpenChange={(nextOpen) => !isPending && setOpen(nextOpen)}
      >
        <Button
          className={""}
          isDisabled={disabled || count === 0}
          size="sm"
          variant="destructive"
        >
          <Trash2 data-icon="inline-start" />
          {actionLabel}
        </Button>
        <AlertDialog>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel isDisabled={isPending}>
              {cancelLabel}
            </AlertDialogCancel>
            <Button
              isDisabled={isPending}
              onPress={async () => {
                await onConfirm()
                setOpen(false)
              }}
              variant="destructive"
            >
              {isPending && <Spinner data-icon="inline-start" />}
              {actionLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialog>
      </AlertDialogTrigger>
    </div>
  )
}
