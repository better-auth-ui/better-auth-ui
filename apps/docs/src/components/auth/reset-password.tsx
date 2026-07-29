"use client"

import { getAuthLinkURL } from "@better-auth-ui/core"
import { useAuth, useResetPassword } from "@better-auth-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type ResetPasswordProps = {
  className?: string
}

/**
 * Render a password reset form that validates the reset token from the URL, accepts a new password (and optional confirmation), and submits it to the auth client.
 *
 * The component checks for a `token` query parameter on mount and, if missing, shows an error toast and navigates to the sign-in page. It exposes per-field validation messages, toggles for password visibility, and disables inputs while the reset request is pending.
 *
 * @returns The password reset form UI ready to be mounted in the app layout.
 */
export function ResetPassword({ className }: ResetPasswordProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    navigate,
    redirectTo,
    viewPaths,
    Link
  } = useAuth()
  const signInURL = getAuthLinkURL(
    `${basePaths.auth}/${viewPaths.auth.signIn}`,
    redirectTo
  )

  const { mutate: resetPassword, isPending } = useResetPassword(authClient, {
    onSuccess: () => {
      toast.success(localization.auth.passwordResetSuccess)
      navigate({ to: signInURL })
    }
  })

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token") as string

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken)
      navigate({ to: signInURL })
    }
  }, [localization.auth.invalidResetPasswordToken, navigate, signInURL])

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get("token") as string

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken)
      navigate({ to: signInURL })
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch)
      return
    }

    resetPassword({ token, newPassword: password })
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.resetPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.password}>
              <FieldLabel htmlFor="password">
                {localization.auth.password}
              </FieldLabel>

              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={localization.auth.newPasswordPlaceholder}
                  required
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                  onChange={() => {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined
                    }))
                  }}
                  onInvalid={(e) => {
                    e.preventDefault()
                    const el = e.target as HTMLInputElement
                    const min = emailAndPassword?.minPasswordLength
                    const max = emailAndPassword?.maxPasswordLength
                    const msg = el.validity.valueMissing
                      ? localization.auth.fieldRequired
                      : el.validity.tooShort
                        ? localization.auth.tooShort.replace(
                            "{{min}}",
                            String(min)
                          )
                        : localization.auth.tooLong.replace(
                            "{{max}}",
                            String(max)
                          )

                    setFieldErrors((prev) => ({
                      ...prev,
                      password: msg
                    }))
                  }}
                  aria-invalid={!!fieldErrors.password}
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

              <FieldError>{fieldErrors.password}</FieldError>
            </Field>

            {emailAndPassword?.confirmPassword && (
              <Field data-invalid={!!fieldErrors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">
                  {localization.auth.confirmPassword}
                </FieldLabel>

                <InputGroup>
                  <InputGroupInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={localization.auth.confirmPasswordPlaceholder}
                    required
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    disabled={isPending}
                    onChange={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined
                      }))
                    }}
                    onInvalid={(e) => {
                      e.preventDefault()
                      const el = e.target as HTMLInputElement
                      const min = emailAndPassword?.minPasswordLength
                      const max = emailAndPassword?.maxPasswordLength
                      const msg = el.validity.valueMissing
                        ? localization.auth.fieldRequired
                        : el.validity.tooShort
                          ? localization.auth.tooShort.replace(
                              "{{min}}",
                              String(min)
                            )
                          : localization.auth.tooLong.replace(
                              "{{max}}",
                              String(max)
                            )

                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: msg
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
                      title={
                        isConfirmPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      onClick={() => {
                        setIsConfirmPasswordVisible((visible) => !visible)
                      }}
                    >
                      {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              </Field>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}

                {localization.auth.resetPassword}
              </Button>
            </div>
          </FieldGroup>
        </form>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
            <Link
              href={getAuthLinkURL(
                `${basePaths.auth}/${viewPaths.auth.signIn}`,
                redirectTo
              )}
              className="underline underline-offset-4"
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  )
}
