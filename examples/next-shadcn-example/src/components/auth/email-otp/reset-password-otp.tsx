"use client"

import {
  type EmailOtpAuthClient,
  useAuth,
  useAuthPlugin,
  useResetPasswordOtp
} from "@better-auth-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"
import { OtpField } from "../otp-field"
import { useIsHydrated } from "../use-is-hydrated"
import { RESET_PASSWORD_OTP_STORAGE_KEY } from "./forgot-password-otp"

export type ResetPasswordOtpProps = {
  className?: string
}

/**
 * Reset a password with an emailed code.
 *
 * Replaces the built-in `<ResetPassword />` view when the email-OTP plugin
 * runs with `passwordReset: true`. There is no token in the URL — the code
 * and the new password are submitted together. The address comes from the
 * forgot-password step, and is asked for again when it isn't there (e.g. the
 * user finishes on another tab).
 *
 * @param className - Additional CSS classes applied to the card.
 */
export function ResetPasswordOtp({ className }: ResetPasswordOtpProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    navigate,
    viewPaths,
    Link
  } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const isHydrated = useIsHydrated()
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(RESET_PASSWORD_OTP_STORAGE_KEY)) || ""
  )
  const [code, setCode] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  useEffect(() => {
    setEmail(sessionStorage.getItem(RESET_PASSWORD_OTP_STORAGE_KEY) ?? "")
  }, [])

  const { mutate: resetPasswordOtp, isPending } = useResetPasswordOtp(
    authClient as EmailOtpAuthClient,
    {
      onError: () => setCode(""),
      onSuccess: () => {
        sessionStorage.removeItem(RESET_PASSWORD_OTP_STORAGE_KEY)
        toast.success(localization.auth.passwordResetSuccess)
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
      }
    }
  )

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const submittedEmail = email || (formData.get("email") as string)

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch)
      return
    }

    if (code.length !== otpLength) {
      toast.error(
        emailOtpLocalization.codeLengthMismatch.replace(
          "{{length}}",
          String(otpLength)
        )
      )
      return
    }

    resetPasswordOtp({ email: submittedEmail, otp: code, password })
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.resetPassword}
        </CardTitle>

        {email && (
          <CardDescription>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email)}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {!email && (
              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="email">
                  {localization.auth.email}
                </FieldLabel>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={localization.auth.emailPlaceholder}
                  required
                  disabled={isPending}
                  onChange={() =>
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                  onInvalid={(e) => {
                    e.preventDefault()

                    setFieldErrors((prev) => ({
                      ...prev,
                      email: (e.target as HTMLInputElement).validationMessage
                    }))
                  }}
                  aria-invalid={!!fieldErrors.email}
                />

                <FieldError>{fieldErrors.email}</FieldError>
              </Field>
            )}

            <OtpField
              autoFocus={Boolean(email)}
              disabled={isPending}
              label={emailOtpLocalization.code}
              length={otpLength}
              name="otp"
              value={code}
              onChange={setCode}
            />

            <Field data-invalid={!!fieldErrors.password}>
              <FieldLabel htmlFor="password">
                {localization.auth.newPassword}
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
                  onChange={() =>
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }
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

                    setFieldErrors((prev) => ({ ...prev, password: msg }))
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
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                  >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <FieldError>{fieldErrors.password}</FieldError>
            </Field>

            {emailAndPassword?.confirmPassword && (
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  {localization.auth.confirmPassword}
                </FieldLabel>

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder={localization.auth.confirmPasswordPlaceholder}
                  required
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                />
              </Field>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}

              {localization.auth.resetPassword}
            </Button>
          </FieldGroup>
        </form>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
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
