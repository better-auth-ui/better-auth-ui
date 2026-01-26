"use client"

import {
  useAuth,
  useChangePassword,
  useSession
} from "@better-auth-ui/react"
import { Check, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type ChangePasswordProps = {
  className?: string
}

/**
 * Render a card form for changing the authenticated user's password.
 *
 * Displays a card with fields for current password, new password, and optionally
 * confirm password (based on `emailAndPassword.confirmPassword`). All other sessions
 * are revoked upon successful password change.
 *
 * @returns A JSX element containing the change-password card and form
 */
export function ChangePassword({ className }: ChangePasswordProps) {
  const { emailAndPassword, localization } = useAuth()
  const { data: sessionData } = useSession()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { mutate: changePassword, isPending } = useChangePassword({
    onError: (error) => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.error(error.error?.message || error.message)
    },
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success(localization.settings.changePasswordSuccess)
    }
  })

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (emailAndPassword?.confirmPassword && newPassword !== confirmPassword) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.error(localization.auth.passwordsDoNotMatch)
      return
    }

    changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className={cn("w-full py-4 md:py-6 gap-4", className)}>
        <CardHeader className="px-4 md:px-6 gap-0">
          <CardTitle className="text-xl">
            {localization.settings.changePassword}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 md:px-6 grid gap-4">
          <Field className="gap-1" data-invalid={!!fieldErrors.currentPassword}>
            <FieldLabel htmlFor="currentPassword">
              {localization.settings.currentPassword}
            </FieldLabel>

            {sessionData ? (
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder={localization.settings.currentPasswordPlaceholder}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  setFieldErrors((prev) => ({
                    ...prev,
                    currentPassword: undefined
                  }))
                }}
                disabled={isPending}
                required
                onInvalid={(e) => {
                  e.preventDefault()
                  setFieldErrors((prev) => ({
                    ...prev,
                    currentPassword: (e.target as HTMLInputElement)
                      .validationMessage
                  }))
                }}
                aria-invalid={!!fieldErrors.currentPassword}
              />
            ) : (
              <Skeleton className="h-9 w-full" />
            )}

            <FieldError>{fieldErrors.currentPassword}</FieldError>
          </Field>

          <Field className="gap-1" data-invalid={!!fieldErrors.newPassword}>
            <FieldLabel htmlFor="newPassword">
              {localization.auth.newPassword}
            </FieldLabel>

            {sessionData ? (
              <InputGroup>
                <InputGroupInput
                  id="newPassword"
                  name="newPassword"
                  type={isNewPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={localization.auth.newPasswordPlaceholder}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setFieldErrors((prev) => ({
                      ...prev,
                      newPassword: undefined
                    }))
                  }}
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                  required
                  onInvalid={(e) => {
                    e.preventDefault()
                    setFieldErrors((prev) => ({
                      ...prev,
                      newPassword: (e.target as HTMLInputElement)
                        .validationMessage
                    }))
                  }}
                  aria-invalid={!!fieldErrors.newPassword}
                />

                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={
                      isNewPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    onClick={() =>
                      setIsNewPasswordVisible(!isNewPasswordVisible)
                    }
                    disabled={isPending}
                  >
                    {isNewPasswordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            ) : (
              <Skeleton className="h-9 w-full" />
            )}

            <FieldError>{fieldErrors.newPassword}</FieldError>
          </Field>

          {emailAndPassword?.confirmPassword && (
            <Field
              className="gap-1"
              data-invalid={!!fieldErrors.confirmPassword}
            >
              <FieldLabel htmlFor="confirmPassword">
                {localization.auth.confirmPassword}
              </FieldLabel>

              {sessionData ? (
                <InputGroup>
                  <InputGroupInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={localization.auth.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined
                      }))
                    }}
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    disabled={isPending}
                    required
                    onInvalid={(e) => {
                      e.preventDefault()
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: (e.target as HTMLInputElement)
                          .validationMessage
                      }))
                    }}
                    aria-invalid={!!fieldErrors.confirmPassword}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={
                        isConfirmPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      onClick={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                      disabled={isPending}
                    >
                      {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              ) : (
                <Skeleton className="h-9 w-full" />
              )}

              <FieldError>{fieldErrors.confirmPassword}</FieldError>
            </Field>
          )}
        </CardContent>

        <CardFooter className="px-4 md:px-6">
          <Button type="submit" disabled={isPending || !sessionData}>
            {isPending ? <Spinner /> : <Check />}

            {localization.settings.updatePassword}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
