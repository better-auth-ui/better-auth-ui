import { authQueryKeys } from "@better-auth-ui/core"
import {
  useAuth,
  useAuthPlugin,
  useDeleteUser,
  useListAccounts
} from "@better-auth-ui/react"
import { Eye, EyeSlash, TriangleExclamation } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Card,
  type CardProps,
  FieldError,
  Form,
  InputGroup,
  Label,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { useQueryClient } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"

import { deleteUserPlugin } from "../../../lib/auth/delete-user-plugin"

export type DeleteAccountProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Danger-zone card to delete the authenticated account, with a confirmation dialog and toasts.
 */
export function DeleteAccount({
  className,
  variant,
  ...props
}: DeleteAccountProps & Omit<CardProps, "children">) {
  const { authClient, basePaths, localization, navigate, viewPaths } = useAuth()

  const {
    localization: deleteUserLocalization,
    sendDeleteAccountVerification
  } = useAuthPlugin(deleteUserPlugin)

  const { data: accounts } = useListAccounts(authClient)

  const queryClient = useQueryClient()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )
  const needsPassword = !sendDeleteAccountVerification && hasCredentialAccount

  const { mutate: deleteUser, isPending } = useDeleteUser(authClient)

  const handleDialogOpenChange = (open: boolean) => {
    setConfirmOpen(open)
    setPassword("")
    setIsPasswordVisible(false)
  }

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const params = {
      ...(needsPassword ? { password } : {})
    }

    deleteUser(params, {
      onSuccess: () => {
        setConfirmOpen(false)
        setPassword("")
        setIsPasswordVisible(false)

        if (sendDeleteAccountVerification) {
          toast.success(deleteUserLocalization.deleteUserVerificationSent)
        } else {
          toast.success(deleteUserLocalization.deleteUserSuccess)
          queryClient.removeQueries({ queryKey: authQueryKeys.all })
          navigate({
            to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
            replace: true
          })
        }
      }
    })
  }

  return (
    <Card className={className} variant={variant} {...props}>
      <Card.Content className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium leading-tight">
            {deleteUserLocalization.deleteAccount}
          </p>

          <p className="text-muted text-xs mt-0.5">
            {deleteUserLocalization.deleteAccountDescription}
          </p>
        </div>

        <AlertDialog>
          <Button
            isDisabled={!accounts}
            size="sm"
            variant="danger-soft"
            onPress={() => setConfirmOpen(true)}
          >
            {deleteUserLocalization.deleteAccount}
          </Button>

          <AlertDialog.Backdrop
            isOpen={confirmOpen}
            onOpenChange={handleDialogOpenChange}
          >
            <AlertDialog.Container>
              <AlertDialog.Dialog>
                <Form onSubmit={handleSubmit}>
                  <AlertDialog.CloseTrigger />

                  <AlertDialog.Header>
                    <AlertDialog.Icon status="danger">
                      <TriangleExclamation />
                    </AlertDialog.Icon>

                    <AlertDialog.Heading>
                      {deleteUserLocalization.deleteAccount}
                    </AlertDialog.Heading>
                  </AlertDialog.Header>

                  <AlertDialog.Body className="overflow-visible">
                    <p className="text-muted text-sm">
                      {deleteUserLocalization.deleteAccountDescription}
                    </p>

                    {needsPassword && (
                      <TextField
                        className="mt-4"
                        name="password"
                        isDisabled={isPending}
                        value={password}
                        onChange={setPassword}
                      >
                        <Label>{localization.auth.password}</Label>

                        <InputGroup variant="secondary">
                          <InputGroup.Input
                            autoComplete="current-password"
                            placeholder={localization.auth.passwordPlaceholder}
                            required
                            type={isPasswordVisible ? "text" : "password"}
                          />

                          <InputGroup.Suffix className="px-0">
                            <Button
                              isIconOnly
                              aria-label={
                                isPasswordVisible
                                  ? localization.auth.hidePassword
                                  : localization.auth.showPassword
                              }
                              isDisabled={isPending}
                              onPress={() =>
                                setIsPasswordVisible(!isPasswordVisible)
                              }
                              size="sm"
                              variant="ghost"
                            >
                              {isPasswordVisible ? <EyeSlash /> : <Eye />}
                            </Button>
                          </InputGroup.Suffix>
                        </InputGroup>

                        <FieldError />
                      </TextField>
                    )}
                  </AlertDialog.Body>

                  <AlertDialog.Footer>
                    <Button
                      slot="close"
                      variant="tertiary"
                      isDisabled={isPending}
                    >
                      {localization.settings.cancel}
                    </Button>

                    <Button
                      type="submit"
                      variant="danger"
                      isPending={isPending}
                    >
                      {isPending && <Spinner color="current" size="sm" />}

                      {deleteUserLocalization.deleteAccount}
                    </Button>
                  </AlertDialog.Footer>
                </Form>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </Card.Content>
    </Card>
  )
}
