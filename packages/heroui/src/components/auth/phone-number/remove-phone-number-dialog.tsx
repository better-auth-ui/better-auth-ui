import { AlertDialog, Button, Spinner } from "@heroui/react"

export type RemovePhoneNumberDialogProps = {
  cancelLabel: string
  description: string
  isPending: boolean
  label: string
  title: string
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
    <AlertDialog>
      <Button size="sm" variant="tertiary" isDisabled={isPending}>
        {label}
      </Button>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-sm">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{description}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={isPending}>
                {cancelLabel}
              </Button>
              <Button
                slot="close"
                variant="danger"
                isDisabled={isPending}
                isPending={isPending}
                onPress={onConfirm}
              >
                {isPending && <Spinner color="current" size="sm" />}
                {label}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
