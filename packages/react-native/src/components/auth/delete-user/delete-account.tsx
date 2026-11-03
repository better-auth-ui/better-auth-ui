import { getFormFieldErrorMessage } from "@better-auth-ui/core"
import {
  authQueryKeys,
  isReauthenticationRequiredError
} from "@better-auth-ui/core"
import {
  useAuth,
  useAuthPlugin,
  useDeleteUser,
  useListAccounts
} from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { deleteUserPlugin } from "../../../lib/auth/delete-user-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { FieldError, Label, TextField } from "../../../primitives/field"
import {
  useAuthForm,
  clearAuthFormFieldServerError,
  isAuthFormFieldInvalid
} from "../auth-form"
import { InputGroup } from "../../../primitives/input"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { TriangleExclamation } from "../../../primitives/ui-icons"

export type DeleteAccountProps = SettingsViewProps

/** Confirm account deletion with a password when the server requires it. */
export function DeleteAccount({ className, variant }: DeleteAccountProps) {
  const { authClient, localization } = useAuth()

  const {
    localization: deleteUserLocalization,
    sendDeleteAccountVerification
  } = useAuthPlugin(deleteUserPlugin)

  const { data: accounts } = useListAccounts(authClient)

  const queryClient = useQueryClient()
  const navigation = useAuthNavigation()
  const colors = useThemeColors()

  const [confirmOpen, setConfirmOpen] = useState(false)

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )
  const needsPassword = !sendDeleteAccountVerification && hasCredentialAccount

  const { mutateAsync: deleteUser, isPending } = useDeleteUser(authClient, {
    meta: { errorPresentation: "inline" }
  })

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && isPending) return
    setConfirmOpen(open)
    form.reset()
  }

  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      const params = {
        ...(needsPassword ? { password: value.password } : {})
      }

      try {
        await deleteUser(params, {
          onSuccess: () => {
            setConfirmOpen(false)
            form.reset()

            if (sendDeleteAccountVerification) {
              toast.success(deleteUserLocalization.deleteUserVerificationSent)
            } else {
              toast.success(deleteUserLocalization.deleteUserSuccess)
              queryClient.removeQueries({ queryKey: authQueryKeys.all })
              navigation.push("signIn", { replace: true })
            }
          }
        })
      } catch (error) {
        if (!isReauthenticationRequiredError(error)) throw error
      }
    }
  })

  return (
    <Card className={className} variant={variant}>
      <Card.Content className="flex-row items-center justify-between gap-4">
        <Box className="flex-1">
          <Txt className="text-sm font-medium leading-tight text-foreground">
            {deleteUserLocalization.deleteAccount}
          </Txt>

          <Txt className="mt-0.5 text-xs text-muted">
            {deleteUserLocalization.deleteAccountDescription}
          </Txt>
        </Box>

        <Button
          isDisabled={!accounts}
          size="sm"
          variant="danger"
          onPress={() => setConfirmOpen(true)}
        >
          {deleteUserLocalization.deleteAccount}
        </Button>

        <AlertDialog isOpen={confirmOpen} onOpenChange={handleDialogOpenChange}>
          <form.AppForm>
            <form.AuthFormRoot serverErrorMessage={localization.errors.generic}>
              <AlertDialog.CloseTrigger />

              <AlertDialog.Header>
                <AlertDialog.Icon status="danger">
                  <TriangleExclamation
                    width={20}
                    height={20}
                    color={colors.danger}
                  />
                </AlertDialog.Icon>

                <AlertDialog.Heading>
                  {deleteUserLocalization.deleteAccount}
                </AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body>
                <Txt className="text-sm text-muted">
                  {deleteUserLocalization.deleteAccountDescription}
                </Txt>

                {needsPassword && (
                  <form.AppField
                    name="password"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? localization.auth.fieldRequired : undefined
                    }}
                  >
                    {(field) => (
                      <TextField
                        className="mt-4 gap-1.5"
                        type="password"
                        autoComplete="current-password"
                        isDisabled={isPending}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(value) => {
                          clearAuthFormFieldServerError(form, field.name)
                          field.handleChange(value)
                        }}
                        error={
                          isAuthFormFieldInvalid(field.state.meta)
                            ? getFormFieldErrorMessage(field.state.meta.errors)
                            : undefined
                        }
                      >
                        <Label>{localization.auth.password}</Label>

                        <InputGroup variant="secondary">
                          <InputGroup.Input
                            type="password"
                            placeholder={localization.auth.passwordPlaceholder}
                            required
                          />
                        </InputGroup>

                        <FieldError />
                      </TextField>
                    )}
                  </form.AppField>
                )}
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button
                  variant="tertiary"
                  isDisabled={isPending}
                  onPress={() => handleDialogOpenChange(false)}
                >
                  {localization.settings.cancel}
                </Button>

                <form.AuthFormSubmitButton
                  variant="danger"
                  isPending={isPending}
                >
                  {deleteUserLocalization.deleteAccount}
                </form.AuthFormSubmitButton>
              </AlertDialog.Footer>
            </form.AuthFormRoot>
          </form.AppForm>
        </AlertDialog>
      </Card.Content>
    </Card>
  )
}
