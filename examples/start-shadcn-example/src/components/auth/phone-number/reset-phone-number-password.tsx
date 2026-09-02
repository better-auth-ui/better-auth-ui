"use client"

import { isPasswordCompromisedError } from "@better-auth-ui/core"
import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useResetPhoneNumberPassword } from "@better-auth-ui/react/plugins/phone-number"
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
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { cn } from "@/lib/utils"
import { useAuthForm } from "../auth-form"
import { OtpField } from "../otp-field"
import { PasswordStrengthMeter } from "../password-strength-meter"
import { useIsHydrated } from "../use-is-hydrated"
import { PHONE_NUMBER_RESET_STORAGE_KEY } from "./forgot-phone-number-password"

export type ResetPhoneNumberPasswordProps = {
  className?: string
}

/** Reset a phone credential password with the code sent to the user. */
export function ResetPhoneNumberPassword({
  className
}: ResetPhoneNumberPasswordProps) {
  const { authClient, basePaths, emailAndPassword, localization, navigate } =
    useAuth()
  const {
    localization: phoneLocalization,
    otpLength,
    viewPaths: phoneNumberViewPaths
  } = useAuthPlugin(phoneNumberPlugin)
  const isHydrated = useIsHydrated()
  const initialPhoneNumber =
    (isHydrated && sessionStorage.getItem(PHONE_NUMBER_RESET_STORAGE_KEY)) || ""
  const [hasStoredPhoneNumber, setHasStoredPhoneNumber] = useState(
    Boolean(initialPhoneNumber)
  )
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const { mutate: resetPassword, isPending } = useResetPhoneNumberPassword(
    authClient as PhoneNumberAuthClient,
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
        sessionStorage.removeItem(PHONE_NUMBER_RESET_STORAGE_KEY)
        toast.success(localization.auth.passwordResetSuccess)
        navigate({
          to: `${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`
        })
      }
    }
  )

  const form = useAuthForm({
    defaultValues: {
      code: "",
      confirmPassword: "",
      password: "",
      phoneNumber: initialPhoneNumber
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
          phoneLocalization.codeLengthMismatch.replace(
            "{{length}}",
            String(otpLength)
          )
        )
        return
      }

      resetPassword({
        phoneNumber: value.phoneNumber,
        otp: value.code,
        newPassword: value.password
      })
    }
  })

  useEffect(() => {
    const stored = sessionStorage.getItem(PHONE_NUMBER_RESET_STORAGE_KEY) ?? ""
    form.setFieldValue("phoneNumber", stored)
    setHasStoredPhoneNumber(Boolean(stored))
  }, [form.setFieldValue])

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">
          {phoneLocalization.resetPassword}
        </CardTitle>
        {hasStoredPhoneNumber && (
          <CardDescription>
            {phoneLocalization.codeSentTo.replace(
              "{{phoneNumber}}",
              form.state.values.phoneNumber
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot>
            <FieldGroup>
              {!hasStoredPhoneNumber && (
                <form.AppField name="phoneNumber">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="passwordResetPhoneNumber">
                        {phoneLocalization.phoneNumber}
                      </FieldLabel>
                      <Input
                        id="passwordResetPhoneNumber"
                        name={field.name}
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={field.state.value}
                        placeholder={phoneLocalization.phoneNumberPlaceholder}
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
                    autoFocus={hasStoredPhoneNumber}
                    disabled={isPending}
                    label={phoneLocalization.phoneCode}
                    length={otpLength}
                    name="otp"
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.AppField>

              <form.AppField name="password">
                {(field) => (
                  <Field data-invalid={Boolean(passwordError)}>
                    <FieldLabel htmlFor="phoneNumberNewPassword">
                      {localization.auth.newPassword}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="phoneNumberNewPassword"
                        name={field.name}
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        value={field.state.value}
                        placeholder={localization.auth.newPasswordPlaceholder}
                        required
                        minLength={emailAndPassword?.minPasswordLength}
                        maxLength={emailAndPassword?.maxPasswordLength}
                        disabled={isPending}
                        onChange={(event) => {
                          setPasswordError("")
                          field.handleChange(event.target.value)
                        }}
                        aria-invalid={Boolean(passwordError)}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          size="icon-xs"
                          aria-label={
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
                      <FieldLabel htmlFor="phoneNumberConfirmPassword">
                        {localization.auth.confirmPassword}
                      </FieldLabel>
                      <Input
                        id="phoneNumberConfirmPassword"
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

              <form.AuthFormSubmitButton
                disabled={
                  isPending || form.state.values.code.length !== otpLength
                }
              >
                {isPending && <Spinner />}
                {phoneLocalization.resetPassword}
              </form.AuthFormSubmitButton>
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
      </CardContent>
    </Card>
  )
}
