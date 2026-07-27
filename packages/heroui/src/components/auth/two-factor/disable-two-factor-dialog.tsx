import type { TwoFactorAuthClient } from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDisableTwoFactor } from "@better-auth-ui/react/plugins/two-factor"
import { ShieldExclamation } from "@gravity-ui/icons"
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
import type { SyntheticEvent } from "react"

import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "../../../lib/auth/use-two-factor-password"

export type DisableTwoFactorDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Confirm turning two-factor off.
 *
 * @param isOpen - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function DisableTwoFactorDialog({
  isOpen,
  onOpenChange
}: DisableTwoFactorDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const { mutate: disableTwoFactor, isPending: isDisabling } =
    useDisableTwoFactor(authClient as TwoFactorAuthClient, {
      onSuccess: () => {
        toast.success(twoFactorLocalization.twoFactorDisabled)
        onOpenChange(false)
      }
    })

  const isPending = isDisabling || isResolvingPasswordRequirement

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string

    disableTwoFactor(requiresPassword ? { password } : {})
  }

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={handleSubmit}>
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="danger">
                <ShieldExclamation />
              </AlertDialog.Icon>

              <AlertDialog.Heading>
                {twoFactorLocalization.disableTwoFactor}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="overflow-visible">
              <p className="text-muted text-sm">
                {requiresPassword
                  ? twoFactorLocalization.passwordConfirmation
                  : twoFactorLocalization.twoFactorDescription}
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
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={isPending}>
                {localization.settings.cancel}
              </Button>

              <Button type="submit" variant="danger" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {twoFactorLocalization.disableTwoFactor}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
