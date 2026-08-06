"use client"

import { getAuthLinkURL } from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useResetPasswordOtp } from "@better-auth-ui/react/plugins/email-otp"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useEffect, useRef, useState } from "react"
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
import { OpenEmailButton } from "../open-email-button"
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
    redirectTo,
    viewPaths,
    Link
  } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const isHydrated = useIsHydrated()
  const initialEmail =
    (isHydrated && sessionStorage.getItem(RESET_PASSWORD_OTP_STORAGE_KEY)) || ""
  const [email, setEmail] = useState(initialEmail)
  const [hasStoredEmail, setHasStoredEmail] = useState(Boolean(initialEmail))
  const [code, setCode] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const submissionLockedRef = useRef(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  useEffect(() => {
    const storedEmail =
      sessionStorage.getItem(RESET_PASSWORD_OTP_STORAGE_KEY) ?? ""
    setEmail(storedEmail)
    setHasStoredEmail(Boolean(storedEmail))
  }, [])

  const { mutate: resetPasswordOtp, isPending } = useResetPasswordOtp(
    authClient as EmailOtpAuthClient,
    {
      onError: () => {
        submissionLockedRef.current = false
        setCode("")
      },
      onSuccess: () => {
        sessionStorage.removeItem(RESET_PASSWORD_OTP_STORAGE_KEY)
        toast.success(localization.auth.passwordResetSuccess)
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
      }
    }
  )

  const submitReset = (
    form: HTMLFormElement,
    submittedCode: string,
    reportErrors: boolean
  ) => {
    if (isPending || submissionLockedRef.current) return

    const formData = new FormData(form)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const submittedEmail = hasStoredEmail
      ? email
      : (formData.get("email") as string)

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      if (reportErrors) {
        toast.error(localization.auth.passwordsDoNotMatch)
      }
      return
    }

    if (submittedCode.length !== otpLength) {
      if (reportErrors) {
        toast.error(
          emailOtpLocalization.codeLengthMismatch.replace(
            "{{length}}",
            String(otpLength)
          )
        )
      }
      return
    }

    submissionLockedRef.current = true
    resetPasswordOtp({ email: submittedEmail, otp: submittedCode, password })
  }

  const tryAutoSubmit = (completedCode?: string) => {
    const form = formRef.current

    if (!form?.matches(":valid")) return

    const formData = new FormData(form)
    const submittedCode = completedCode ?? String(formData.get("otp") ?? "")

    submitReset(form, submittedCode, false)
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    submitReset(e.currentTarget, code, true)
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.resetPassword}
        </CardTitle>

        {hasStoredEmail && email && (
          <CardDescription>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email)}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit}>
          <FieldGroup>
            {!hasStoredEmail && (
              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor="email">
                  {localization.auth.email}
                </FieldLabel>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  placeholder={localization.auth.emailPlaceholder}
                  required
                  disabled={isPending}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }}
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
              autoFocus={hasStoredEmail}
              disabled={isPending}
              label={emailOtpLocalization.code}
              length={otpLength}
              name="otp"
              value={code}
              onChange={setCode}
              onComplete={tryAutoSubmit}
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

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}

                {localization.auth.resetPassword}
              </Button>

              {email && <OpenEmailButton email={email} variant="secondary" />}
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
