"use client"

import { useAuth } from "@better-auth-ui/react"
import { Check, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

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
import { useSession } from "@/hooks/auth/use-session"
import { useChangePassword } from "@/hooks/settings/use-change-password"
import { cn } from "@/lib/utils"

export type ChangePasswordProps = {
  className?: string
}

/**
 * Renders a card form that allows the authenticated user to change their password.
 *
 * Shows fields for current password, new password, and — when emailAndPassword.confirmPassword is true — a confirmation field.
 * Successful submission revokes all other sessions for the user.
 *
 * @returns A JSX element containing the change-password form card
 */
export function ChangePassword({ className }: ChangePasswordProps) {
  const { emailAndPassword, localization } = useAuth()
  const { data: sessionData } = useSession()
  const [, formAction, isPending] = useChangePassword()

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  return (
    <form action={formAction}>
      <Card className={cn("w-full py-4 md:py-6 gap-4 md:gap-6", className)}>
        <CardHeader className="px-4 md:px-6 gap-0">
          <CardTitle className="text-xl">
            {localization.settings.changePassword}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 md:px-6 grid gap-4 md:gap-6">
          <Field className="gap-1">
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
                disabled={isPending}
                required
                onChange={() => {
                  setFieldErrors((prev) => ({
                    ...prev,
                    currentPassword: undefined
                  }))
                }}
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

          <Field className="gap-1">
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
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                  required
                  onChange={() => {
                    setFieldErrors((prev) => ({
                      ...prev,
                      newPassword: undefined
                    }))
                  }}
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
            <Field className="gap-1">
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
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    disabled={isPending}
                    required
                    onChange={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined
                      }))
                    }}
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