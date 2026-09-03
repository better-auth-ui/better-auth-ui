"use client"

import {
  getAuthLinkURL,
  isPasswordCompromisedError,
  validateEmailAddress,
  validateMatchingValue,
  validateStringLength
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
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { cn } from "@/lib/utils"
import {
  isAuthFormFieldInvalid,
  setAuthFormServerError,
  submitAuthForm,
  useAuthForm
} from "../auth-form"
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

  const { mutateAsync: resetPasswordOtp, isPending } = useResetPasswordOtp(
    authClient as EmailOtpAuthClient,
    {
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so it
        // belongs against the field rather than in a toast.
        if (isPasswordCompromisedError(error)) {
          setAuthFormServerError(
            form,
            { fields: { password: localization.auth.passwordCompromised } },
            localization.auth.passwordCompromised
          )
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

  const validatePassword = (value: string) =>
    validateStringLength(value, {
      maxLength: emailAndPassword?.maxPasswordLength,
      maxLengthMessage: localization.auth.tooLong.replace(
        "{{max}}",
        String(emailAndPassword?.maxPasswordLength)
      ),
      minLength: emailAndPassword?.minPasswordLength,
      minLengthMessage: localization.auth.tooShort.replace(
        "{{min}}",
        String(emailAndPassword?.minPasswordLength)
      ),
      requiredMessage: localization.auth.fieldRequired
    })

  const form = useAuthForm({
    defaultValues: {
      code: "",
      confirmPassword: "",
      email: initialEmail,
      password: ""
    },
    onSubmit: async ({ value }) => {
      await resetPasswordOtp({
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
                <form.AppField
                  name="email"
                  validators={{
                    onChange: ({ value }) =>
                      validateEmailAddress(value, {
                        invalidMessage: localization.auth.invalidEmail,
                        requiredMessage: localization.auth.fieldRequired
                      })
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      autoComplete="email"
                      disabled={isPending}
                      id="email"
                      label={localization.auth.email}
                      placeholder={localization.auth.emailPlaceholder}
                      required
                      type="email"
                    />
                  )}
                </form.AppField>
              )}

              <form.AppField
                name="code"
                validators={{
                  onChange: ({ value }) =>
                    value.length === otpLength
                      ? undefined
                      : emailOtpLocalization.codeLengthMismatch.replace(
                          "{{length}}",
                          String(otpLength)
                        )
                }}
              >
                {(field) => (
                  <OtpField
                    autoFocus={hasStoredEmail}
                    disabled={isPending}
                    label={emailOtpLocalization.code}
                    length={otpLength}
                    name="otp"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onComplete={() => void submitAuthForm(form)}
                  />
                )}
              </form.AppField>

              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) => validatePassword(value)
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={isAuthFormFieldInvalid(field.state.meta)}
                  >
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
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isAuthFormFieldInvalid(field.state.meta)}
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

                    <field.AuthFormFieldError />

                    <PasswordStrengthMeter password={field.state.value} />
                  </Field>
                )}
              </form.AppField>

              {emailAndPassword?.confirmPassword && (
                <form.AppField
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ["password"],
                    onChange: ({ value, fieldApi }) =>
                      validateMatchingValue(
                        value,
                        fieldApi.form.getFieldValue("password"),
                        localization.auth.passwordsDoNotMatch
                      )
                  }}
                >
                  {(field) => (
                    <Field
                      data-invalid={isAuthFormFieldInvalid(field.state.meta)}
                    >
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
                        aria-invalid={isAuthFormFieldInvalid(field.state.meta)}
                      />

                      <field.AuthFormFieldError />
                    </Field>
                  )}
                </form.AppField>
              )}

              <div className="flex flex-col gap-3">
                <form.AuthFormSubmitButton disabled={isPending}>
                  {localization.auth.resetPassword}
                </form.AuthFormSubmitButton>

                {email && <OpenEmailButton email={email} variant="secondary" />}
              </div>
              <form.AuthFormServerError />
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
