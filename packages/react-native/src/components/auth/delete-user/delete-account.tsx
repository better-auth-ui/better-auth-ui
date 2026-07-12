import { authQueryKeys } from "@better-auth-ui/core"
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
import { Form } from "../../../primitives/form"
import { InputGroup } from "../../../primitives/input"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { TriangleExclamation } from "../../../primitives/ui-icons"

export type DeleteAccountProps = SettingsViewProps

/**
 * Danger-zone card to delete the authenticated account, with a confirmation
 * dialog and toasts. Mirrors the heroui `DeleteAccount`, adapted for React
 * Native: the confirm dialog is the RN `AlertDialog` (a `Modal`, controlled
 * via `isOpen`/`onOpenChange` instead of `AlertDialog.Backdrop`), the password
 * field (when required) is controlled state (no `FormData`), and success
 * navigates via the RN navigation adapter instead of a `basePaths`/`viewPaths`
 * URL join.
 */
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
  const [password, setPassword] = useState("")

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )
  const needsPassword = !sendDeleteAccountVerification && hasCredentialAccount

  const { mutate: deleteUser, isPending } = useDeleteUser(authClient)

  const handleDialogOpenChange = (open: boolean) => {
    setConfirmOpen(open)
    setPassword("")
  }

  const handleSubmit = () => {
    const params = {
      ...(needsPassword ? { password } : {})
    }

    deleteUser(params, {
      onSuccess: () => {
        setConfirmOpen(false)
        setPassword("")

        if (sendDeleteAccountVerification) {
          toast.success(deleteUserLocalization.deleteUserVerificationSent)
        } else {
          toast.success(deleteUserLocalization.deleteUserSuccess)
          queryClient.removeQueries({ queryKey: authQueryKeys.all })
          navigation.push("signIn", { replace: true })
        }
      }
    })
  }

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
          <Form onSubmit={handleSubmit}>
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
                <TextField
                  className="mt-4 gap-1.5"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  isDisabled={isPending}
                  value={password}
                  onChange={setPassword}
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
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button
                variant="tertiary"
                isDisabled={isPending}
                onPress={() => handleDialogOpenChange(false)}
              >
                {localization.settings.cancel}
              </Button>

              <Button type="submit" variant="danger" isPending={isPending}>
                {deleteUserLocalization.deleteAccount}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog>
      </Card.Content>
    </Card>
  )
}
