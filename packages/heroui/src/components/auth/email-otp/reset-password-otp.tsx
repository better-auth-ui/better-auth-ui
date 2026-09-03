import {
  getAuthLinkURL,
  isPasswordCompromisedError,
  validateEmailAddress,
  validateStringLength
} from "@better-auth-ui/core"
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useResetPasswordOtp } from "@better-auth-ui/react/plugins/email-otp"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  Input,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField,
  toast,
  useIsHydrated
} from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useEffect, useState } from "react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import {
  isAuthFormFieldInvalid,
  setAuthFormServerError,
  submitAuthForm,
  useAuthForm
} from "../auth-form"
import { OpenEmailButton } from "../open-email-button"
import { OtpField } from "../otp-field"
import { PasswordStrengthMeter } from "../password-strength-meter"
import { RESET_PASSWORD_OTP_STORAGE_KEY } from "./forgot-password-otp"

export type ResetPasswordOtpProps = {
  className?: string
  variant?: CardProps["variant"]
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
 * @param variant - Card variant.
 */
export function ResetPasswordOtp({
  className,
  variant
}: ResetPasswordOtpProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    navigate,
    redirectTo,
    viewPaths
  } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const isHydrated = useIsHydrated()
  const initialEmail =
    (isHydrated && sessionStorage.getItem(RESET_PASSWORD_OTP_STORAGE_KEY)) || ""
  const [hasStoredEmail, setHasStoredEmail] = useState(Boolean(initialEmail))
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)
  const { mutateAsync: resetPasswordOtp, isPending } = useResetPasswordOtp(
    authClient as EmailOtpAuthClient,
    {
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so
        // it belongs against the field rather than in a toast.
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
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.resetPassword}
        </Card.Title>

        {hasStoredEmail && email && (
          <Card.Description>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email)}
          </Card.Description>
        )}
      </Card.Header>

      <Card.Content className="gap-4">
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
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
                  <TextField
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    isDisabled={isPending}
                    isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                    validationBehavior="aria"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  >
                    <Label>{localization.auth.email}</Label>

                    <Input
                      placeholder={localization.auth.emailPlaceholder}
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    />

                    <field.AuthFormFieldError />
                  </TextField>
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
                  isDisabled={isPending}
                  label={emailOtpLocalization.code}
                  length={otpLength}
                  name="otp"
                  value={field.state.value}
                  variant={variant}
                  onChange={field.handleChange}
                  onComplete={() => void submitAuthForm(form)}
                />
              )}
            </form.AppField>

            <form.AppField
              name="password"
              validators={{ onChange: ({ value }) => validatePassword(value) }}
            >
              {(field) => (
                <TextField
                  name={field.name}
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                  isDisabled={isPending}
                  validationBehavior="aria"
                >
                  <Label>{localization.auth.newPassword}</Label>

                  <InputGroup
                    variant={
                      variant === "transparent" ? "primary" : "secondary"
                    }
                  >
                    <InputGroup.Input
                      placeholder={localization.auth.newPasswordPlaceholder}
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
                        size="sm"
                        variant="ghost"
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        isDisabled={isPending}
                      >
                        {isPasswordVisible ? <EyeSlash /> : <Eye />}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>

                  <field.AuthFormFieldError />

                  <PasswordStrengthMeter password={field.state.value} />
                </TextField>
              )}
            </form.AppField>

            {emailAndPassword?.confirmPassword && (
              <form.AppField
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ["password"],
                  onChange: ({ value, fieldApi }) =>
                    validatePassword(value) ??
                    (value === fieldApi.form.getFieldValue("password")
                      ? undefined
                      : localization.auth.passwordsDoNotMatch)
                }}
              >
                {(field) => (
                  <TextField
                    name={field.name}
                    autoComplete="new-password"
                    isDisabled={isPending}
                    isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                    validationBehavior="aria"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  >
                    <Label>{localization.auth.confirmPassword}</Label>

                    <InputGroup
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    >
                      <InputGroup.Input
                        placeholder={
                          localization.auth.confirmPasswordPlaceholder
                        }
                        type={isConfirmPasswordVisible ? "text" : "password"}
                      />

                      <InputGroup.Suffix className="px-0">
                        <Button
                          isIconOnly
                          aria-label={
                            isConfirmPasswordVisible
                              ? localization.auth.hidePassword
                              : localization.auth.showPassword
                          }
                          size="sm"
                          variant="ghost"
                          onPress={() =>
                            setIsConfirmPasswordVisible(
                              !isConfirmPasswordVisible
                            )
                          }
                          isDisabled={isPending}
                        >
                          {isConfirmPasswordVisible ? <EyeSlash /> : <Eye />}
                        </Button>
                      </InputGroup.Suffix>
                    </InputGroup>

                    <field.AuthFormFieldError />
                  </TextField>
                )}
              </form.AppField>
            )}

            <div className="flex flex-col gap-3">
              <form.AuthFormSubmitButton
                className="w-full"
                isDisabled={isPending}
              >
                {isPending && <Spinner color="current" size="sm" />}

                {localization.auth.resetPassword}
              </form.AuthFormSubmitButton>

              {email && <OpenEmailButton email={email} variant="secondary" />}
            </div>
            <form.AuthFormServerError />
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={getAuthLinkURL(
              `${basePaths.auth}/${viewPaths.auth.signIn}`,
              redirectTo
            )}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
