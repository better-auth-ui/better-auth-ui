import {
  type EmailOtpAuthClient,
  useAuth,
  useAuthPlugin,
  useResetPasswordOtp
} from "@better-auth-ui/react"
import { Eye, EyeSlash } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField,
  toast,
  useIsHydrated
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

import { emailOtpPlugin } from "../../../lib/auth/email-otp-plugin"
import { OtpField } from "../otp-field"
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
    viewPaths
  } = useAuth()
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin)

  const isHydrated = useIsHydrated()
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(RESET_PASSWORD_OTP_STORAGE_KEY)) || ""
  )
  const [code, setCode] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

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

  const validatePassword = (value: string) => {
    if (!value) return localization.auth.fieldRequired
    const min = emailAndPassword?.minPasswordLength
    const max = emailAndPassword?.maxPasswordLength
    if (min && value.length < min)
      return localization.auth.tooShort.replace("{{min}}", String(min))
    if (max && value.length > max)
      return localization.auth.tooLong.replace("{{max}}", String(max))
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const submittedEmail = email || (formData.get("email") as string)

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.danger(localization.auth.passwordsDoNotMatch)
      return
    }

    if (code.length !== otpLength) {
      toast.danger(
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
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.resetPassword}
        </Card.Title>

        {email && (
          <Card.Description>
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email)}
          </Card.Description>
        )}
      </Card.Header>

      <Card.Content className="gap-4">
        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!email && (
            <TextField
              name="email"
              type="email"
              autoComplete="email"
              isDisabled={isPending}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                  return localization.auth.invalidEmail
              }}
            >
              <Label>{localization.auth.email}</Label>

              <Input
                placeholder={localization.auth.emailPlaceholder}
                required
                variant={variant === "transparent" ? "primary" : "secondary"}
              />

              <FieldError />
            </TextField>
          )}

          <OtpField
            autoFocus={Boolean(email)}
            isDisabled={isPending}
            label={emailOtpLocalization.code}
            length={otpLength}
            name="otp"
            value={code}
            variant={variant}
            onChange={setCode}
          />

          <TextField
            minLength={emailAndPassword?.minPasswordLength}
            maxLength={emailAndPassword?.maxPasswordLength}
            name="password"
            autoComplete="new-password"
            isDisabled={isPending}
            validate={validatePassword}
          >
            <Label>{localization.auth.newPassword}</Label>

            <InputGroup
              variant={variant === "transparent" ? "primary" : "secondary"}
            >
              <InputGroup.Input
                name="password"
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
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  isDisabled={isPending}
                >
                  {isPasswordVisible ? <EyeSlash /> : <Eye />}
                </Button>
              </InputGroup.Suffix>
            </InputGroup>

            <FieldError />
          </TextField>

          {emailAndPassword?.confirmPassword && (
            <TextField
              minLength={emailAndPassword?.minPasswordLength}
              maxLength={emailAndPassword?.maxPasswordLength}
              name="confirmPassword"
              autoComplete="new-password"
              isDisabled={isPending}
              validate={validatePassword}
            >
              <Label>{localization.auth.confirmPassword}</Label>

              <InputGroup
                variant={variant === "transparent" ? "primary" : "secondary"}
              >
                <InputGroup.Input
                  name="confirmPassword"
                  placeholder={localization.auth.confirmPasswordPlaceholder}
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  required
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
                      setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                    }
                    isDisabled={isPending}
                  >
                    {isConfirmPasswordVisible ? <EyeSlash /> : <Eye />}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>

              <FieldError />
            </TextField>
          )}

          <Button type="submit" className="w-full" isPending={isPending}>
            {isPending && <Spinner color="current" size="sm" />}

            {localization.auth.resetPassword}
          </Button>
        </Form>
      </Card.Content>

      <Card.Footer className="flex-col gap-3">
        <Description className="text-sm">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="text-accent no-underline hover:underline decoration-accent-hover"
          >
            {localization.auth.signIn}
          </Link>
        </Description>
      </Card.Footer>
    </Card>
  )
}
