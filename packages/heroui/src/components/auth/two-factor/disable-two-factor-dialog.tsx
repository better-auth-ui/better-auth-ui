import type { TwoFactorAuthClient } from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useDisableTwoFactor } from "@better-auth-ui/react/plugins/two-factor"
import { ShieldExclamation } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
  toast
} from "@heroui/react"

import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "../../../lib/auth/use-two-factor-password"
import { useAuthForm } from "../auth-form"

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

  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: ({ value }) =>
      disableTwoFactor(requiresPassword ? { password: value.password } : {})
  })

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <form.AppForm>
            <form.AuthFormRoot>
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
                  <form.AppField name="password">
                    {(field) => (
                      <TextField
                        className="mt-4"
                        name={field.name}
                        autoComplete="current-password"
                        isDisabled={isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
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
                  </form.AppField>
                )}
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={isPending}>
                  {localization.settings.cancel}
                </Button>

                <form.AuthFormSubmitButton
                  variant="danger"
                  isDisabled={isPending}
                >
                  {isPending && <Spinner color="current" size="sm" />}

                  {twoFactorLocalization.disableTwoFactor}
                </form.AuthFormSubmitButton>
              </AlertDialog.Footer>
            </form.AuthFormRoot>
          </form.AppForm>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
