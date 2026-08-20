"use client"

import { isPasswordCompromisedError } from "@better-auth-ui/core"
import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useResetPhoneNumberPassword } from "@better-auth-ui/react/plugins/phone-number"
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
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [hasStoredPhoneNumber, setHasStoredPhoneNumber] = useState(
    Boolean(initialPhoneNumber)
  )
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    phoneNumber?: string
    password?: string
  }>({})

  useEffect(() => {
    const stored = sessionStorage.getItem(PHONE_NUMBER_RESET_STORAGE_KEY) ?? ""
    setPhoneNumber(stored)
    setHasStoredPhoneNumber(Boolean(stored))
  }, [])

  const { mutate: resetPassword, isPending } = useResetPhoneNumberPassword(
    authClient as PhoneNumberAuthClient,
    {
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so it
        // belongs against the field rather than in a toast.
        if (isPasswordCompromisedError(error)) {
          setFieldErrors((prev) => ({
            ...prev,
            password: localization.auth.passwordCompromised
          }))
        }

        setCode("")
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

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch)
      return
    }
    if (code.length !== otpLength) {
      toast.error(
        phoneLocalization.codeLengthMismatch.replace(
          "{{length}}",
          String(otpLength)
        )
      )
      return
    }

    resetPassword({
      phoneNumber,
      otp: code,
      newPassword: password
    })
  }

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
              phoneNumber
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {!hasStoredPhoneNumber && (
              <Field data-invalid={Boolean(fieldErrors.phoneNumber)}>
                <FieldLabel htmlFor="passwordResetPhoneNumber">
                  {phoneLocalization.phoneNumber}
                </FieldLabel>
                <Input
                  id="passwordResetPhoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phoneNumber}
                  placeholder={phoneLocalization.phoneNumberPlaceholder}
                  required
                  disabled={isPending}
                  onChange={(event) => {
                    setPhoneNumber(event.target.value)
                    setFieldErrors((current) => ({
                      ...current,
                      phoneNumber: undefined
                    }))
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setFieldErrors((current) => ({
                      ...current,
                      phoneNumber: event.currentTarget.validationMessage
                    }))
                  }}
                  aria-invalid={Boolean(fieldErrors.phoneNumber)}
                />
                <FieldError>{fieldErrors.phoneNumber}</FieldError>
              </Field>
            )}

            <OtpField
              autoFocus={hasStoredPhoneNumber}
              disabled={isPending}
              label={phoneLocalization.phoneCode}
              length={otpLength}
              name="otp"
              value={code}
              onChange={setCode}
            />

            <Field data-invalid={Boolean(fieldErrors.password)}>
              <FieldLabel htmlFor="phoneNumberNewPassword">
                {localization.auth.newPassword}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="phoneNumberNewPassword"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  placeholder={localization.auth.newPasswordPlaceholder}
                  required
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setFieldErrors((current) => ({
                      ...current,
                      password: undefined
                    }))
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setFieldErrors((current) => ({
                      ...current,
                      password: event.currentTarget.validationMessage
                    }))
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
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
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                  >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{fieldErrors.password}</FieldError>

              <PasswordStrengthMeter password={password} />
            </Field>

            {emailAndPassword?.confirmPassword && (
              <Field>
                <FieldLabel htmlFor="phoneNumberConfirmPassword">
                  {localization.auth.confirmPassword}
                </FieldLabel>
                <Input
                  id="phoneNumberConfirmPassword"
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

            <Button
              type="submit"
              disabled={isPending || code.length !== otpLength}
            >
              {isPending && <Spinner />}
              {phoneLocalization.resetPassword}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
