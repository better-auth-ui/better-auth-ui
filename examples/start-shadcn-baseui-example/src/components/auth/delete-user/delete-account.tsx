"use client"

import { authQueryKeys, validateStringLength } from "@better-auth-ui/core"
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { deleteUserPlugin } from "@/lib/auth/delete-user-plugin"
import { cn } from "@/lib/utils"
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form"

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

  const { mutate: deleteUser, isPending } = useDeleteUser(authClient)

  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: ({ value }) => {
      deleteUser(needsPassword ? { password: value.password } : {}, {
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
      })
    }
  })

  const handleDialogOpenChange = (open: boolean) => {
    setConfirmOpen(open)
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

        <AlertDialog open={confirmOpen} onOpenChange={handleDialogOpenChange}>
          <AlertDialogTrigger
            className={cn(
              buttonVariants({ variant: "destructive", size: "sm" })
            )}
            disabled={!accounts}
          >
            {deleteUserLocalization.deleteAccount}
          </AlertDialogTrigger>

          <AlertDialogContent>
            <form.AppForm>
              <form.AuthFormRoot className="flex flex-col gap-6">
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
                      const isInvalid = isAuthFormFieldInvalid(field.state.meta)
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="delete-password">
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
                              disabled={isPending}
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
                                title={
                                  isPasswordVisible
                                    ? localization.auth.hidePassword
                                    : localization.auth.showPassword
                                }
                                onClick={() => {
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

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    {localization.settings.cancel}
                  </AlertDialogCancel>

                  <form.AuthFormSubmitButton
                    variant="destructive"
                    disabled={isPending}
                  >
                    {isPending && <Spinner />}

                    {deleteUserLocalization.deleteAccount}
                  </form.AuthFormSubmitButton>
                </AlertDialogFooter>
              </form.AuthFormRoot>
            </form.AppForm>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
