import {
  type TwoFactorAuthClient,
  useAuth,
  useAuthPlugin,
  useGenerateBackupCodes
} from "@better-auth-ui/react"
import { Key } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { type SyntheticEvent, useState } from "react"

import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "../../../lib/auth/use-two-factor-password"
import { BackupCodes } from "./backup-codes"

export type RegenerateBackupCodesDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Replace the existing backup codes with a fresh set.
 *
 * The new codes are shown once, in component state only — closing the dialog
 * is the point of no return, which is why the copy button sits right there.
 *
 * @param isOpen - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function RegenerateBackupCodesDialog({
  isOpen,
  onOpenChange
}: RegenerateBackupCodesDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const [codes, setCodes] = useState<string[]>([])

  const {
    mutate: generateBackupCodes,
    isPending: isGenerating,
    reset: resetGeneration
  } = useGenerateBackupCodes(authClient as TwoFactorAuthClient, {
    onSuccess: (data) => {
      setCodes(data.backupCodes)
      toast.success(twoFactorLocalization.backupCodesRegenerated)
    }
  })

  const isPending = isGenerating || isResolvingPasswordRequirement

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)

    if (!open) {
      setCodes([])
      // Clears the resolved backup codes from the mutation cache.
      resetGeneration()
    }
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (codes.length) {
      handleOpenChange(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string

    generateBackupCodes(requiresPassword ? { password } : {})
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={handleSubmit}>
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="default">
                <Key />
              </AlertDialog.Icon>

              <AlertDialog.Heading>
                {twoFactorLocalization.backupCodes}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="overflow-visible">
              {codes.length ? (
                <BackupCodes codes={codes} />
              ) : (
                <>
                  <p className="text-muted text-sm">
                    {requiresPassword
                      ? twoFactorLocalization.passwordConfirmation
                      : twoFactorLocalization.backupCodesDescription}
                  </p>

                  {requiresPassword && (
                    <TextField
                      className="mt-4"
                      name="password"
                      autoComplete="current-password"
                      isDisabled={isPending}
                    >
                      <Label>{localization.auth.password}</Label>

                      <Input
                        autoFocus
                        required
                        type="password"
                        placeholder={localization.auth.passwordPlaceholder}
                        variant="secondary"
                      />

                      <FieldError />
                    </TextField>
                  )}
                </>
              )}
            </AlertDialog.Body>

            <AlertDialog.Footer>
              {!codes.length && (
                <Button slot="close" variant="tertiary" isDisabled={isPending}>
                  {localization.settings.cancel}
                </Button>
              )}

              <Button type="submit" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {codes.length
                  ? twoFactorLocalization.done
                  : twoFactorLocalization.regenerateBackupCodes}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
