import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useResetPhoneNumberPassword } from "@better-auth-ui/react/plugins/phone-number"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  Spinner,
  TextField,
  toast,
  useIsHydrated
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

import { phoneNumberPlugin } from "../../../lib/auth/phone-number-plugin"
import { OtpField } from "../otp-field"
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
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [hasStoredPhoneNumber, setHasStoredPhoneNumber] = useState(
    Boolean(initialPhoneNumber)
  )
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(PHONE_NUMBER_RESET_STORAGE_KEY) ?? ""
    setPhoneNumber(stored)
    setHasStoredPhoneNumber(Boolean(stored))
  }, [])

  const { mutate: resetPassword, isPending } = useResetPhoneNumberPassword(
    authClient as PhoneNumberAuthClient,
    {
      onError: () => setCode(""),
      onSuccess: () => {
        sessionStorage.removeItem(PHONE_NUMBER_RESET_STORAGE_KEY)
        toast.success(localization.auth.passwordResetSuccess)
        navigate({
          to: `${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`
        })
      }
    }
  )

  const validatePassword = (value: string) => {
    if (!value) return localization.auth.fieldRequired
    const min = emailAndPassword?.minPasswordLength
    const max = emailAndPassword?.maxPasswordLength
    if (min && value.length < min)
      return localization.auth.tooShort.replace("{{min}}", String(min))
    if (max && value.length > max)
      return localization.auth.tooLong.replace("{{max}}", String(max))
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.danger(localization.auth.passwordsDoNotMatch)
      return
    }
    if (code.length !== otpLength) {
      toast.danger(
        phoneLocalization.codeLengthMismatch.replace(
          "{{length}}",
          String(otpLength)
        )
      )
      return
    }

    resetPassword({ phoneNumber, otp: code, newPassword: password })
  }

  const passwordInput = (
    <InputGroup variant={variant === "transparent" ? "primary" : "secondary"}>
      <InputGroup.Input
        placeholder={localization.auth.newPasswordPlaceholder}
        type={isPasswordVisible ? "text" : "password"}
        required
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
  )

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
        <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!hasStoredPhoneNumber && (
            <TextField
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              value={phoneNumber}
              isDisabled={isPending}
              onChange={setPhoneNumber}
              validate={(value) =>
                value ? undefined : localization.auth.fieldRequired
              }
            >
              <Label>{phoneLocalization.phoneNumber}</Label>
              <Input
                inputMode="tel"
                placeholder={phoneLocalization.phoneNumberPlaceholder}
                required
                variant={variant === "transparent" ? "primary" : "secondary"}
              />
              <FieldError />
            </TextField>
          )}
          <OtpField
            autoFocus={hasStoredPhoneNumber}
            isDisabled={isPending}
            label={phoneLocalization.phoneCode}
            length={otpLength}
            name="otp"
            value={code}
            variant={variant}
            onChange={setCode}
          />
          <TextField
            name="password"
            autoComplete="new-password"
            minLength={emailAndPassword?.minPasswordLength}
            maxLength={emailAndPassword?.maxPasswordLength}
            value={password}
            isDisabled={isPending}
            onChange={setPassword}
            validate={validatePassword}
          >
            <Label>{localization.auth.newPassword}</Label>
            {passwordInput}
            <FieldError />
          </TextField>
          {emailAndPassword?.confirmPassword && (
            <TextField
              name="confirmPassword"
              autoComplete="new-password"
              isDisabled={isPending}
              validate={validatePassword}
            >
              <Label>{localization.auth.confirmPassword}</Label>
              <Input
                type="password"
                placeholder={localization.auth.confirmPasswordPlaceholder}
                required
                variant={variant === "transparent" ? "primary" : "secondary"}
              />
              <FieldError />
            </TextField>
          )}
          <Button
            className="w-full"
            type="submit"
            isDisabled={code.length !== otpLength}
            isPending={isPending}
          >
            {isPending && <Spinner color="current" size="sm" />}
            {phoneLocalization.resetPassword}
          </Button>
        </Form>
      </Card.Content>
    </Card>
  )
}
