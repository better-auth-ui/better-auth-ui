import {
  isPasswordCompromisedError,
  validateStringLength
} from "@better-auth-ui/core"
import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useResetPhoneNumberPassword } from "@better-auth-ui/react/plugins/phone-number"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Input,
  InputGroup,
  Label,
  Spinner,
  TextField,
  toast,
  useIsHydrated
} from "@heroui/react"
import { useSelector } from "@tanstack/react-form"
import { useEffect, useState } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import {
  isAuthFormFieldInvalid,
  setAuthFormServerError,
  useAuthForm
} from "../auth-form"
import { OtpField } from "../otp-field"
import { PasswordStrengthMeter } from "../password-strength-meter"
import { PHONE_NUMBER_RESET_STORAGE_KEY } from "./forgot-phone-number-password"

export type ResetPhoneNumberPasswordProps = {
  className?: string
  variant?: CardProps["variant"]
}

/** Reset a phone credential password with a verification code. */
export function ResetPhoneNumberPassword({
  className,
  variant
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

  const { mutateAsync: resetPassword, isPending } = useResetPhoneNumberPassword(
    authClient as PhoneNumberAuthClient,
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
        sessionStorage.removeItem(PHONE_NUMBER_RESET_STORAGE_KEY)
        toast.success(localization.auth.passwordResetSuccess)
        navigate({
          to: `${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`
        })
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
      password: "",
      phoneNumber: initialPhoneNumber
    },
    onSubmit: async ({ value }) => {
      await resetPassword({
        phoneNumber: value.phoneNumber,
        otp: value.code,
        newPassword: value.password
      })
    }
  })
  const codeComplete = useSelector(
    form.store,
    (state) => state.values.code.length === otpLength
  )
  const phoneNumber = useSelector(
    form.store,
    (state) => state.values.phoneNumber
  )

  useEffect(() => {
    const stored = sessionStorage.getItem(PHONE_NUMBER_RESET_STORAGE_KEY) ?? ""
    form.setFieldValue("phoneNumber", stored)
    setHasStoredPhoneNumber(Boolean(stored))
  }, [form.setFieldValue])

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="mb-1 text-xl font-semibold">
          {phoneLocalization.resetPassword}
        </Card.Title>
        {hasStoredPhoneNumber && (
          <Card.Description>
            {phoneLocalization.codeSentTo.replace(
              "{{phoneNumber}}",
              phoneNumber
            )}
          </Card.Description>
        )}
      </Card.Header>
      <Card.Content className="gap-4">
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
            {!hasStoredPhoneNumber && (
              <form.AppField
                name="phoneNumber"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: localization.auth.fieldRequired
                    })
                }}
              >
                {(field) => (
                  <TextField
                    type="tel"
                    autoComplete="tel"
                    value={field.state.value}
                    name={field.name}
                    isDisabled={isPending}
                    isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                    validationBehavior="aria"
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  >
                    <Label>{phoneLocalization.phoneNumber}</Label>
                    <Input
                      inputMode="tel"
                      placeholder={phoneLocalization.phoneNumberPlaceholder}
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
                    : phoneLocalization.codeLengthMismatch.replace(
                        "{{length}}",
                        String(otpLength)
                      )
              }}
            >
              {(field) => (
                <OtpField
                  autoFocus={hasStoredPhoneNumber}
                  isDisabled={isPending}
                  label={phoneLocalization.phoneCode}
                  length={otpLength}
                  name="otp"
                  value={field.state.value}
                  variant={variant}
                  onChange={field.handleChange}
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
                  isDisabled={isPending}
                  isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                  validationBehavior="aria"
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
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
                        isDisabled={isPending}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
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
                    <Input
                      type="password"
                      placeholder={localization.auth.confirmPasswordPlaceholder}
                      variant={
                        variant === "transparent" ? "primary" : "secondary"
                      }
                    />
                    <field.AuthFormFieldError />
                  </TextField>
                )}
              </form.AppField>
            )}
            <form.AuthFormServerError />
            <form.AuthFormSubmitButton
              className="w-full"
              isDisabled={!codeComplete || isPending}
            >
              {isPending && <Spinner color="current" size="sm" />}
              {phoneLocalization.resetPassword}
            </form.AuthFormSubmitButton>
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>
    </Card>
  )
}
