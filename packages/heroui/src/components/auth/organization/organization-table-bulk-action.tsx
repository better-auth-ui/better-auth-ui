import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { TrashBin } from "@gravity-ui/icons"
import { AlertDialog, Button, Spinner } from "@heroui/react"
import { useState } from "react"

export function OrganizationTableBulkAction({
  cancelLabel,
  confirmLabel,
  description,
  disabled,
  onConfirm,
  pending,
  selectedCount,
  title,
  localization
}: {
  cancelLabel: string
  confirmLabel: string
  description: string
  disabled?: boolean
  onConfirm: () => Promise<void>
  pending: boolean
  selectedCount: number
  title: string
  localization: OrganizationLocalization
}) {
  const [open, setOpen] = useState(false)
  if (!selectedCount) return null
  return (
    <AlertDialog
      isOpen={open}
      onOpenChange={(next) => !pending && setOpen(next)}
    >
      <Button
        size="sm"
        variant="danger-soft"
        isDisabled={disabled}
        onPress={() => setOpen(true)}
      >
        <TrashBin />
        {confirmLabel} ({selectedCount})
      </Button>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger isDisabled={pending} />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger">
                <TrashBin />
              </AlertDialog.Icon>
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex flex-col gap-3">
              <p className="text-muted text-sm">{description}</p>
              <p className="text-sm font-medium">
                {localization.selectedCount.replace(
                  "{{count}}",
                  String(selectedCount)
                )}
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={pending}>
                {cancelLabel}
              </Button>
              <Button
                variant="danger"
                isPending={pending}
                isDisabled={pending}
                onPress={async () => {
                  await onConfirm()
                  setOpen(false)
                }}
              >
                {pending && <Spinner color="current" size="sm" />}
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
