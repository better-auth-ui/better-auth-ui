"use client"
import {
  authQueryKeys,
  isReauthenticationRequiredError,
  validateStringLength
} from "@better-auth-ui/core"
import {
  useAuth,
  useAuthPlugin,
  useDeleteUser,
  useListAccounts
} from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff, TriangleAlert } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
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
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { deleteUserPlugin } from "@/lib/auth/delete-user-plugin"
import { cn } from "cn"
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form"
import { ReauthenticationAction } from "../reauthentication"
export type DeleteAccountProps = {
  className?: string
}
/**
 * Danger-zone card to delete the authenticated account, with a confirmation dialog and toasts.
 */
export function DeleteAccount({ className }: DeleteAccountProps) {
  const { authClient, basePaths, localization, viewPaths, navigate } = useAuth()
  const {
    localization: deleteUserLocalization,
    sendDeleteAccountVerification
  } = useAuthPlugin(deleteUserPlugin)
  const { data: accounts } = useListAccounts(authClient)
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential"
  )
  const needsPassword = !sendDeleteAccountVerification && hasCredentialAccount
  const deleteUser = useDeleteUser(authClient, {
    meta: { errorPresentation: "inline" }
  })
  const needsReauthentication = isReauthenticationRequiredError(
    deleteUser.error
  )
  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      await deleteUser.mutateAsync(
        needsPassword ? { password: value.password } : {},
        {
          onSuccess: () => {
            setConfirmOpen(false)
            form.reset()
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
        }
      )
    }
  })
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && deleteUser.isPending) return
    setConfirmOpen(open)
    deleteUser.reset()
    form.reset()
    setIsPasswordVisible(false)
  }
  return (
    <Card className={cn("border-destructive", className)}>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium leading-tight">
            {deleteUserLocalization.deleteAccount}
          </p>

          <p className="text-muted-foreground text-xs mt-0.5">
            {deleteUserLocalization.deleteAccountDescription}
          </p>
        </div>

        <AlertDialogTrigger
          isOpen={confirmOpen}
          onOpenChange={handleDialogOpenChange}
        >
          <Button isDisabled={!accounts} variant="destructive" size="sm">
            {deleteUserLocalization.deleteAccount}
          </Button>

          <AlertDialog>
            {needsReauthentication ? (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {localization.settings.reauthenticationTitle}
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <ReauthenticationAction className="p-0" showTitle={false} />
              </>
            ) : (
              <form.AppForm>
                <form.AuthFormRoot
                  className="flex flex-col gap-6"
                  serverErrorMessage={localization.errors.generic}
                >
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                      <TriangleAlert />
                    </AlertDialogMedia>

                    <AlertDialogTitle>
                      {deleteUserLocalization.deleteAccount}
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                      {deleteUserLocalization.deleteAccountDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  {needsPassword && (
                    <form.AppField
                      name="password"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
                            requiredMessage: localization.auth.fieldRequired
                          })
                      }}
                    >
                      {(field) => {
                        const isInvalid = isAuthFormFieldInvalid(
                          field.state.meta
                        )
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel
                              htmlFor="delete-password"
                              id="delete-password-label"
                            >
                              {localization.auth.password}
                            </FieldLabel>

                            <InputGroup>
                              <InputGroupInput
                                id="delete-password"
                                name={field.name}
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder={
                                  localization.auth.passwordPlaceholder
                                }
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                                disabled={deleteUser.isPending}
                                required
                              />

                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  size="icon-xs"
                                  aria-label={
                                    isPasswordVisible
                                      ? localization.auth.hidePassword
                                      : localization.auth.showPassword
                                  }
                                  aria-description={
                                    isPasswordVisible
                                      ? localization.auth.hidePassword
                                      : localization.auth.showPassword
                                  }
                                  onPress={() => {
                                    setIsPasswordVisible((visible) => !visible)
                                  }}
                                >
                                  {isPasswordVisible ? <EyeOff /> : <Eye />}
                                </InputGroupButton>
                              </InputGroupAddon>
                            </InputGroup>

                            <field.AuthFormFieldError />
                          </Field>
                        )
                      }}
                    </form.AppField>
                  )}

                  <form.AuthFormServerError />

                  <AlertDialogFooter>
                    <AlertDialogCancel isDisabled={deleteUser.isPending}>
                      {localization.settings.cancel}
                    </AlertDialogCancel>

                    <form.AuthFormSubmitButton
                      isPending={deleteUser.isPending}
                      variant="destructive"
                      isDisabled={deleteUser.isPending}
                    >
                      {deleteUserLocalization.deleteAccount}
                    </form.AuthFormSubmitButton>
                  </AlertDialogFooter>
                </form.AuthFormRoot>
              </form.AppForm>
            )}
          </AlertDialog>
        </AlertDialogTrigger>
      </CardContent>
    </Card>
  )
}
