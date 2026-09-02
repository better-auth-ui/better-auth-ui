"use client"

import {
  getAuthLinkURL,
  isPasswordCompromisedError
} from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useResetPasswordOtp } from "@better-auth-ui/react/plugins/email-otp"
import { useSelector } from "@tanstack/react-form"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
import { useAuthForm } from "../auth-form"
import { OpenEmailButton } from "../open-email-button"
import { OtpField } from "../otp-field"
import { PasswordStrengthMeter } from "../password-strength-meter"
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
  const [hasStoredEmail, setHasStoredEmail] = useState(Boolean(initialEmail))
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const { mutate: resetPasswordOtp, isPending } = useResetPasswordOtp(
    authClient as EmailOtpAuthClient,
    {
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so it
        // belongs against the field rather than in a toast.
        if (isPasswordCompromisedError(error)) {
          setPasswordError(localization.auth.passwordCompromised)
        }
        form.setFieldValue("code", "")
      },
      onSuccess: () => {
        sessionStorage.removeItem(RESET_PASSWORD_OTP_STORAGE_KEY)
        toast.success(localization.auth.passwordResetSuccess)
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
      }
    }
  )

  const form = useAuthForm({
    defaultValues: {
      code: "",
      confirmPassword: "",
      email: initialEmail,
      password: ""
    },
    onSubmit: ({ value }) => {
      if (
        emailAndPassword?.confirmPassword &&
        value.password !== value.confirmPassword
      ) {
        toast.error(localization.auth.passwordsDoNotMatch)
        return
      }
      if (value.code.length !== otpLength) {
        toast.error(
          emailOtpLocalization.codeLengthMismatch.replace(
            "{{length}}",
            String(otpLength)
          )
        )
        return
      }
      resetPasswordOtp({
        email: value.email,
        otp: value.code,
        password: value.password
      })
    }
  })
  const email = useSelector(form.store, (state) => state.values.email)

  useEffect(() => {
    const storedEmail =
      sessionStorage.getItem(RESET_PASSWORD_OTP_STORAGE_KEY) ?? ""
    form.setFieldValue("email", storedEmail)
    setHasStoredEmail(Boolean(storedEmail))
  }, [form.setFieldValue])

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
        <form.AppForm>
          <form.AuthFormRoot>
            <FieldGroup>
              {!hasStoredEmail && (
                <form.AppField name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="email">
                        {localization.auth.email}
                      </FieldLabel>

                      <Input
                        id="email"
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        value={field.state.value}
                        placeholder={localization.auth.emailPlaceholder}
                        required
                        disabled={isPending}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />

                      <field.AuthFormFieldError />
                    </Field>
                  )}
                </form.AppField>
              )}

              <form.AppField name="code">
                {(field) => (
                  <OtpField
                    autoFocus={hasStoredEmail}
                    disabled={isPending}
                    label={emailOtpLocalization.code}
                    length={otpLength}
                    name="otp"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onComplete={(code) => {
                      field.handleChange(code)
                      if (form.state.values.password) void form.handleSubmit()
                    }}
                  />
                )}
              </form.AppField>

              <form.AppField name="password">
                {(field) => (
                  <Field data-invalid={Boolean(passwordError)}>
                    <FieldLabel htmlFor="password">
                      {localization.auth.newPassword}
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        id="password"
                        name={field.name}
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={localization.auth.newPasswordPlaceholder}
                        required
                        minLength={emailAndPassword?.minPasswordLength}
                        maxLength={emailAndPassword?.maxPasswordLength}
                        disabled={isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          setPasswordError("")
                          field.handleChange(event.target.value)
                        }}
                        aria-invalid={Boolean(passwordError)}
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
                          onClick={() =>
                            setIsPasswordVisible((visible) => !visible)
                          }
                        >
                          {isPasswordVisible ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    {passwordError && <FieldError>{passwordError}</FieldError>}

                    <PasswordStrengthMeter password={field.state.value} />
                  </Field>
                )}
              </form.AppField>

              {emailAndPassword?.confirmPassword && (
                <form.AppField name="confirmPassword">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">
                        {localization.auth.confirmPassword}
                      </FieldLabel>

                      <Input
                        id="confirmPassword"
                        name={field.name}
                        type="password"
                        autoComplete="new-password"
                        placeholder={
                          localization.auth.confirmPasswordPlaceholder
                        }
                        required
                        minLength={emailAndPassword?.minPasswordLength}
                        maxLength={emailAndPassword?.maxPasswordLength}
                        disabled={isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                    </Field>
                  )}
                </form.AppField>
              )}

              <div className="flex flex-col gap-3">
                <form.AuthFormSubmitButton disabled={isPending}>
                  {isPending && <Spinner />}

                  {localization.auth.resetPassword}
                </form.AuthFormSubmitButton>

                {email && <OpenEmailButton email={email} variant="secondary" />}
              </div>
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>

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
